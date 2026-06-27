import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation } from '@tanstack/react-router'
import { useAccount } from 'wagmi'
import { usePlayerSession } from './PlayerSessionProvider'
import { computeDeviceFingerprint } from '@/utilities/sybil/fingerprint'
import { postSessionSignal, SessionBehavioral } from '@/api/sessionSignal'

// Captures device fingerprint + lightweight behavioral signals and pushes them
// to /v1/session/signal so the backend Sybil correlator (gaming-service task
// 26) can cluster wallets that share a device or IP. One coalesced POST per
// (session, route) — never per click — and always fire-and-forget so a
// transient backend hiccup never blocks an entry attempt.

const SIGNAL_DEBOUNCE_MS = 1500
const ENTRY_CADENCE_CAP = 64

type EntryCadenceRecorder = (timestampIso?: string) => void

type Routes = {
    pagePath: string
    sessionId: string
    sessionStartedAt: string
}

const SignalGuardContext = createSignalContext()

function createSignalContext() {
    // Module-scoped helpers so non-React callers (entry hook, claim hook) can
    // record cadence timestamps without taking a context dependency.
    let recorder: EntryCadenceRecorder | null = null
    return {
        register(fn: EntryCadenceRecorder | null) {
            recorder = fn
        },
        record(timestampIso: string) {
            recorder?.(timestampIso)
        },
    }
}

export function recordEntryCadence(at: Date = new Date()): void {
    SignalGuardContext.record(at.toISOString())
}

export default function SessionSignalProvider({ children }: { children: ReactNode }) {
    const { isConnected } = useAccount()
    const { session } = usePlayerSession()
    const location = useLocation()
    const pagePath = location.pathname

    const sessionMetaRef = useRef<Routes | null>(null)
    const sentForRouteRef = useRef<Set<string>>(new Set())
    const fingerprintCacheRef = useRef<string | null>(null)
    const behavioralRef = useRef<SessionBehavioral | null>(null)
    const entryCadenceRef = useRef<string[]>([])
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Reset per-session state when the wallet connects fresh or we get a new
    // SIWE token. If the player rotates wallets without disconnecting, the
    // sessionId regenerates so we never blend signals from two identities.
    useEffect(() => {
        if (!isConnected || !session) {
            sessionMetaRef.current = null
            sentForRouteRef.current = new Set()
            entryCadenceRef.current = []
            return
        }
        const next: Routes = {
            pagePath,
            sessionId: cryptoRandomId(),
            sessionStartedAt: new Date().toISOString(),
        }
        sessionMetaRef.current = next
        sentForRouteRef.current = new Set()
        entryCadenceRef.current = []
    }, [isConnected, session?.token]) // eslint-disable-line react-hooks/exhaustive-deps

    // Lightweight scroll/click counters scoped to the current session. Cheap
    // enough that the spec's "cap payload size" requirement falls out for free
    // (two ints + capped cadence array).
    useEffect(() => {
        if (!sessionMetaRef.current) return
        const meta = sessionMetaRef.current
        behavioralRef.current = {
            sessionId: meta.sessionId,
            sessionStartedAt: meta.sessionStartedAt,
            pagePath,
            scrolls: 0,
            clicks: 0,
            entryCadence: [],
            pageLoadedAt: new Date().toISOString(),
        }
        const onScroll = () => {
            if (behavioralRef.current) behavioralRef.current.scrolls += 1
        }
        const onClick = () => {
            if (behavioralRef.current) behavioralRef.current.clicks += 1
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('click', onClick, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('click', onClick)
        }
    }, [pagePath, session?.token])

    // Register the cadence recorder so the entry/claim hooks can push
    // timestamps without importing this provider directly.
    useEffect(() => {
        SignalGuardContext.register((iso?: string) => {
            const at = iso ?? new Date().toISOString()
            const next = entryCadenceRef.current.concat(at)
            entryCadenceRef.current = next.length > ENTRY_CADENCE_CAP
                ? next.slice(next.length - ENTRY_CADENCE_CAP)
                : next
        })
        return () => SignalGuardContext.register(null)
    }, [])

    const sendSignal = useCallback(async () => {
        const meta = sessionMetaRef.current
        const behavioral = behavioralRef.current
        if (!meta || !behavioral) return
        if (!isPagePretxRelevant(meta.pagePath)) return
        const routeKey = `${meta.sessionId}:${meta.pagePath}`
        if (sentForRouteRef.current.has(routeKey)) return
        sentForRouteRef.current.add(routeKey)

        try {
            if (!fingerprintCacheRef.current) {
                const fp = await computeDeviceFingerprint()
                fingerprintCacheRef.current = fp.fingerprintHash
            }
            await postSessionSignal({
                fingerprint_hash: fingerprintCacheRef.current,
                behavioral: {
                    ...behavioral,
                    entryCadence: entryCadenceRef.current.slice(),
                },
            })
        } catch (e) {
            // postSessionSignal already swallows network errors; this catches
            // a thrown SubtleCrypto/computeDeviceFingerprint failure so the
            // provider stays mounted.
            console.warn('[SessionSignalProvider] signal send failed', e)
        }
    }, [])

    // Debounce the actual send so a route change followed by a wagmi
    // reconnect (which fires effects in quick succession) only produces one
    // beacon per (session, route).
    useEffect(() => {
        if (!isConnected || !session) return
        const meta = sessionMetaRef.current
        if (!meta) return
        meta.pagePath = pagePath
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => { void sendSignal() }, SIGNAL_DEBOUNCE_MS)
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [isConnected, session?.token, pagePath, sendSignal]) // eslint-disable-line react-hooks/exhaustive-deps

    return useMemo(() => <>{children}</>, [children])
}

// Routes that can lead to a deposit (entry purchase) or withdrawal (claim).
// Anything else — `/transparency`, `/how-to-play`, `/verify` — is read-only
// from a money-flow perspective so we skip the beacon to keep the per-session
// signal volume tight.
function isPagePretxRelevant(pathname: string): boolean {
    if (pathname === '/' || pathname === '/play') return true
    if (pathname.startsWith('/responsible-gaming')) return true
    return false
}

function cryptoRandomId(): string {
    const c = globalThis.crypto
    if (c?.randomUUID) return c.randomUUID()
    // Fallback for jsdom: 12 hex chars is enough for a per-session collision-
    // free ID since it's only used inside the browser tab.
    const buf = new Uint8Array(8)
    if (c?.getRandomValues) c.getRandomValues(buf)
    let hex = ''
    for (let i = 0; i < buf.length; i += 1) hex += buf[i]!.toString(16).padStart(2, '0')
    return hex || `${Date.now().toString(16)}${Math.floor(Math.random() * 1e6).toString(16)}`
}
