import { useCallback, useState } from 'react'

const STORAGE_KEY = 'blockpot.referralCode'

// Mirrors ReferralManager._normalizeCode's charset so garbage never reaches the chain.
const CODE_RE = /^[A-Za-z0-9_]{3,32}$/

function readInitial(): string {
    try {
        // A `?ref=CODE` deep link (shared by referrers) wins over any stored value, and is
        // persisted so the attribution survives navigation and wallet-connect round-trips
        // until the first attributed entry consumes it.
        const fromUrl = new URLSearchParams(window.location.search).get('ref')
        if (fromUrl && CODE_RE.test(fromUrl)) {
            window.localStorage.setItem(STORAGE_KEY, fromUrl)
            return fromUrl
        }
        return window.localStorage.getItem(STORAGE_KEY) ?? ''
    } catch {
        return ''
    }
}

// The not-yet-bound player's candidate referral code (deep link or manual entry). Cleared
// after the first successful attributed entry — the on-chain binding takes over from there.
export default function usePendingReferralCode() {
    const [code, setCodeState] = useState<string>(readInitial)

    const setCode = useCallback((value: string) => {
        setCodeState(value)
        try {
            if (value) window.localStorage.setItem(STORAGE_KEY, value)
            else window.localStorage.removeItem(STORAGE_KEY)
        } catch {
            // storage unavailable (private mode) — in-memory state still works
        }
    }, [])

    const clear = useCallback(() => setCode(''), [setCode])

    return { code, setCode, clear, isWellFormed: CODE_RE.test(code) }
}
