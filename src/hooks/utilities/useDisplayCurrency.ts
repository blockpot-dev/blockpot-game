import { useCallback, useEffect, useState } from 'react'

export type DisplayCurrency = 'ETH' | 'USD' | 'EUR'

export const DISPLAY_CURRENCY_STORAGE_KEY = 'bp:ui:displayCurrency'

export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrency = 'ETH'

const DEFAULT_CYCLE: DisplayCurrency[] = ['ETH', 'USD', 'EUR']

function isDisplayCurrency(value: unknown): value is DisplayCurrency {
    return value === 'ETH' || value === 'USD' || value === 'EUR'
}

function readStoredCurrency(): DisplayCurrency {
    if (typeof window === 'undefined') return DEFAULT_DISPLAY_CURRENCY
    try {
        const raw = window.localStorage.getItem(DISPLAY_CURRENCY_STORAGE_KEY)
        return isDisplayCurrency(raw) ? raw : DEFAULT_DISPLAY_CURRENCY
    } catch {
        return DEFAULT_DISPLAY_CURRENCY
    }
}

function writeStoredCurrency(value: DisplayCurrency): void {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.setItem(DISPLAY_CURRENCY_STORAGE_KEY, value)
    } catch {
        // localStorage unavailable / quota — degrade silently to in-memory only.
    }
}

export type UseDisplayCurrencyResult = {
    currency: DisplayCurrency
    cycle: (available?: DisplayCurrency[]) => void
    setCurrency: (value: DisplayCurrency) => void
}

// Browser-local preference for which currency the EntryCost badge displays
// (ETH / USD / EUR). Persists to localStorage on cycle so the choice survives
// reloads. SSR-safe via `typeof window` guards and try/catch around every
// storage call.
export default function useDisplayCurrency(): UseDisplayCurrencyResult {
    const [currency, setCurrencyState] = useState<DisplayCurrency>(DEFAULT_DISPLAY_CURRENCY)

    useEffect(() => {
        setCurrencyState(readStoredCurrency())
    }, [])

    const setCurrency = useCallback((value: DisplayCurrency) => {
        setCurrencyState(value)
        writeStoredCurrency(value)
    }, [])

    const cycle = useCallback((available?: DisplayCurrency[]) => {
        const choices = available && available.length > 0 ? available : DEFAULT_CYCLE
        if (choices.length < 2) return
        setCurrencyState(prev => {
            const idx = choices.indexOf(prev)
            const next = choices[(idx === -1 ? 0 : idx + 1) % choices.length]
            writeStoredCurrency(next)
            return next
        })
    }, [])

    return { currency, cycle, setCurrency }
}
