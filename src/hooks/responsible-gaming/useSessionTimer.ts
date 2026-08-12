import { useCallback, useEffect, useState } from 'react'
import usePlayerActivityState from '@/hooks/player-summary/usePlayerActivityState'

export type SessionSnapshot = {
    startedAt: number // epoch ms of session start
    netSpendBaselineEurMinor: number // lifetime net spend captured at session start
}

// v2 prefix so this never collides with the naturally-expiring `bp:rg:session:`
// keys the task-99 removal orphaned in players' browsers.
function storageKey(address: string): string {
    return `bp:rg:session:v2:${address}`
}

function readSnapshot(address: string): SessionSnapshot | null {
    try {
        const raw = window.localStorage.getItem(storageKey(address))
        if (!raw) return null
        const parsed = JSON.parse(raw) as Partial<SessionSnapshot>
        if (typeof parsed.startedAt !== 'number' || typeof parsed.netSpendBaselineEurMinor !== 'number') {
            return null
        }
        return { startedAt: parsed.startedAt, netSpendBaselineEurMinor: parsed.netSpendBaselineEurMinor }
    } catch {
        return null
    }
}

function writeSnapshot(address: string, snapshot: SessionSnapshot) {
    try {
        window.localStorage.setItem(storageKey(address), JSON.stringify(snapshot))
    } catch {
        // Storage unavailable — the in-memory snapshot still drives this tab.
    }
}

// Client-only session clock + net-spend meter for the reality check (task 113).
// Lifetime net spend (cumWagered − cumWon, EUR-minor) comes from the existing
// on-chain-derived activity state; the session figure is the delta against the
// baseline captured when the session snapshot was created. No network beyond
// the reads the app already performs.
export default function useSessionTimer(address: string) {
    const { state } = usePlayerActivityState()
    const netNowEurMinor = state ? state.cumWageredEurMinor - state.cumWonEurMinor : null

    const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(() => readSnapshot(address))
    const [nowMs, setNowMs] = useState(() => Date.now())

    useEffect(() => {
        setSnapshot(readSnapshot(address))
    }, [address])

    // Start a session lazily, once the live net-spend figure is available to
    // capture as the baseline.
    useEffect(() => {
        if (snapshot !== null || netNowEurMinor === null) return
        const fresh: SessionSnapshot = { startedAt: Date.now(), netSpendBaselineEurMinor: netNowEurMinor }
        writeSnapshot(address, fresh)
        setSnapshot(fresh)
    }, [address, snapshot, netNowEurMinor])

    useEffect(() => {
        const id = window.setInterval(() => setNowMs(Date.now()), 1000)
        return () => window.clearInterval(id)
    }, [])

    const resetSession = useCallback(() => {
        const fresh: SessionSnapshot = {
            startedAt: Date.now(),
            netSpendBaselineEurMinor: netNowEurMinor ?? 0,
        }
        writeSnapshot(address, fresh)
        setSnapshot(fresh)
    }, [address, netNowEurMinor])

    return {
        elapsedMs: snapshot ? Math.max(0, nowMs - snapshot.startedAt) : 0,
        sessionNetSpendEurMinor: snapshot !== null && netNowEurMinor !== null
            ? netNowEurMinor - snapshot.netSpendBaselineEurMinor
            : 0,
        resetSession,
    }
}
