import { useCallback, useState } from 'react'

// Legacy persistence key from the pre-launch referral build. Actively removed on
// mount below; restore persistence (with its own consent basis) when the referral
// programme ships (BLO-594). Until then attribution must not be written to the
// device: a first-party attribution key sits outside the strictly-necessary
// storage exemption the Cookie Policy relies on (BLO-801).
const LEGACY_STORAGE_KEY = 'blockpot.referralCode'

// Mirrors ReferralManager._normalizeCode's charset so garbage never reaches the chain.
const CODE_RE = /^[A-Za-z0-9_]{3,32}$/

function readInitial(): string {
    try {
        window.localStorage.removeItem(LEGACY_STORAGE_KEY)
        const fromUrl = new URLSearchParams(window.location.search).get('ref')
        return fromUrl && CODE_RE.test(fromUrl) ? fromUrl : ''
    } catch {
        return ''
    }
}

// The not-yet-bound player's candidate referral code (deep link or manual entry),
// held in memory only for this page load. Cleared after the first successful
// attributed entry — the on-chain binding takes over from there.
export default function usePendingReferralCode() {
    const [code, setCodeState] = useState<string>(readInitial)

    const setCode = useCallback((value: string) => {
        setCodeState(value)
    }, [])

    const clear = useCallback(() => setCode(''), [setCode])

    return { code, setCode, clear, isWellFormed: CODE_RE.test(code) }
}
