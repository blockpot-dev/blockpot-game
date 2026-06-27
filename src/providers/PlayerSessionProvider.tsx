import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
    clearToken as moduleClearToken,
    getToken as moduleGetToken,
    setToken as moduleSetToken,
    TokenSnapshot,
} from '@/api/gamingServiceClient'

// Holds the short-lived Bearer JWT issued by POST /v1/auth/verify and consumed
// by every session-gated backend endpoint (/v1/attestation,
// /v1/players/register, /v1/kyc/*, /v1/pretx/*, /v1/self-exclusion/*,
// /v1/rg/*, /v1/player/*). Intentionally in-memory only — the backend TTL is
// ~5 minutes per task-17 config defaults, so persisting across reloads is not
// useful and would expand the XSS attack surface.
//
// The token is mirrored into a module-level store (gamingServiceClient.ts) so
// non-React helpers (e.g. evaluatePretxDeposit) can attach the Bearer header
// without subscribing to context.

export type PlayerSession = TokenSnapshot

type PlayerSessionContextValue = {
    session: PlayerSession | null
    setSession: (session: PlayerSession) => void
    clearSession: () => void
    activeToken: () => string | null
}

const PlayerSessionContext = createContext<PlayerSessionContextValue | null>(null)

export default function PlayerSessionProvider({ children }: { children: ReactNode }) {
    const [session, setSessionState] = useState<PlayerSession | null>(() => moduleGetToken())

    const setSession = useCallback((next: PlayerSession) => {
        moduleSetToken(next)
        setSessionState(next)
    }, [])

    const clearSession = useCallback(() => {
        moduleClearToken()
        setSessionState(null)
    }, [])

    // The module store can self-clear when a token expires, or be wiped after a
    // 401 from authedFetch. Re-poll on a coarse interval so React state
    // converges without forcing every consumer to subscribe to the module.
    useEffect(() => {
        if (!session) return
        const tick = () => {
            const snapshot = moduleGetToken()
            if (snapshot !== session) {
                setSessionState(snapshot)
            }
        }
        const intervalId = window.setInterval(tick, 15_000)
        return () => window.clearInterval(intervalId)
    }, [session])

    const activeToken = useCallback(() => {
        const snapshot = moduleGetToken()
        return snapshot?.token ?? null
    }, [])

    const value = useMemo<PlayerSessionContextValue>(
        () => ({ session, setSession, clearSession, activeToken }),
        [session, setSession, clearSession, activeToken],
    )

    return (
        <PlayerSessionContext.Provider value={value}>
            {children}
        </PlayerSessionContext.Provider>
    )
}

export function usePlayerSession(): PlayerSessionContextValue {
    const ctx = useContext(PlayerSessionContext)
    if (!ctx) {
        throw new Error('usePlayerSession must be used within a PlayerSessionProvider')
    }
    return ctx
}
