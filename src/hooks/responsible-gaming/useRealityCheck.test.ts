import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useRealityCheck from './useRealityCheck'
import {
    REALITY_CHECK_DEFAULT_INTERVAL_MINUTES,
    REALITY_CHECK_MAX_MINUTES,
    REALITY_CHECK_MIN_MINUTES,
} from '@/constants/responsibleGaming'

const ADDRESS = '0x1c1030cF44a9bD7BC77e9FE1B5Eb586Ea3CF8F62'
const KEY = `bp:rg:reality-check:${ADDRESS}`

// The happy-dom/node combo in this suite does not provide window.localStorage;
// back it with a Map so the hook's real persistence path is exercised.
const store = new Map<string, string>()
beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: {
            getItem: (k: string) => store.get(k) ?? null,
            setItem: (k: string, v: string) => { store.set(k, String(v)) },
            removeItem: (k: string) => { store.delete(k) },
            clear: () => { store.clear() },
        },
    })
})

describe('useRealityCheck', () => {
    afterEach(() => {
        window.localStorage.clear()
    })

    it('seeds from the operator defaults when nothing is stored', () => {
        const { result } = renderHook(() => useRealityCheck(ADDRESS))
        expect(result.current.config.intervalMinutes).toBe(REALITY_CHECK_DEFAULT_INTERVAL_MINUTES)
        expect(result.current.config.enabled).toBe(true)
    })

    it('persists interval changes to localStorage and clamps to [MIN, MAX]', () => {
        const { result } = renderHook(() => useRealityCheck(ADDRESS))

        act(() => result.current.setInterval(90))
        expect(result.current.config.intervalMinutes).toBe(90)
        expect(JSON.parse(window.localStorage.getItem(KEY)!).intervalMinutes).toBe(90)

        act(() => result.current.setInterval(1))
        expect(result.current.config.intervalMinutes).toBe(REALITY_CHECK_MIN_MINUTES)

        act(() => result.current.setInterval(100_000))
        expect(result.current.config.intervalMinutes).toBe(REALITY_CHECK_MAX_MINUTES)
    })

    it('persists enable/disable and reads back a stored config', () => {
        window.localStorage.setItem(KEY, JSON.stringify({ intervalMinutes: 30, enabled: false }))
        const { result } = renderHook(() => useRealityCheck(ADDRESS))
        expect(result.current.config).toEqual({ intervalMinutes: 30, enabled: false })

        act(() => result.current.setEnabled(true))
        expect(JSON.parse(window.localStorage.getItem(KEY)!).enabled).toBe(true)
    })
})
