import { useCallback, useEffect, useState } from 'react'
import {
    REALITY_CHECK_DEFAULT_INTERVAL_MINUTES,
    REALITY_CHECK_MAX_MINUTES,
    REALITY_CHECK_MIN_MINUTES,
} from '@/constants/responsibleGaming'

export type RealityCheckConfig = {
    intervalMinutes: number
    enabled: boolean
}

const DEFAULT_CONFIG: RealityCheckConfig = {
    intervalMinutes: REALITY_CHECK_DEFAULT_INTERVAL_MINUTES,
    enabled: true,
}

function storageKey(address: string): string {
    return `bp:rg:reality-check:${address}`
}

function clampInterval(minutes: number): number {
    if (!Number.isFinite(minutes)) return REALITY_CHECK_DEFAULT_INTERVAL_MINUTES
    return Math.min(REALITY_CHECK_MAX_MINUTES, Math.max(REALITY_CHECK_MIN_MINUTES, Math.round(minutes)))
}

function readConfig(address: string): RealityCheckConfig {
    try {
        const raw = window.localStorage.getItem(storageKey(address))
        if (!raw) return DEFAULT_CONFIG
        const parsed = JSON.parse(raw) as Partial<RealityCheckConfig>
        return {
            intervalMinutes: clampInterval(parsed.intervalMinutes ?? DEFAULT_CONFIG.intervalMinutes),
            enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_CONFIG.enabled,
        }
    } catch {
        return DEFAULT_CONFIG
    }
}

// Client-only reality-check configuration (task 113): localStorage-backed,
// seeded from the operator defaults, never touches the network. Keyed per
// wallet address so households sharing a browser keep separate settings.
export default function useRealityCheck(address: string) {
    const [config, setConfig] = useState<RealityCheckConfig>(() => readConfig(address))

    useEffect(() => {
        setConfig(readConfig(address))
    }, [address])

    const persist = useCallback((next: RealityCheckConfig) => {
        setConfig(next)
        try {
            window.localStorage.setItem(storageKey(address), JSON.stringify(next))
        } catch {
            // Storage may be unavailable (private mode) — keep the in-memory value.
        }
    }, [address])

    const setInterval = useCallback((minutes: number) => {
        persist({ ...readConfig(address), intervalMinutes: clampInterval(minutes) })
    }, [address, persist])

    const setEnabled = useCallback((enabled: boolean) => {
        persist({ ...readConfig(address), enabled })
    }, [address, persist])

    return { config, setInterval, setEnabled }
}
