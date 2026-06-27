import { useEffect, useRef } from 'react'
import { Address } from 'viem'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useSiweSignature from '@/hooks/contracts/player-registry/useSiweSignature'
import { ZERO_ADDRESS } from '@/web3/constants'
import { subscribeSessionExpired } from './gamingServiceClient'

// Mounted once near the top of the tree. When the gaming-service client emits
// a SESSION_EXPIRED event (token cleared after a 401), this re-runs the SIWE
// handshake so the next authenticated call succeeds without the player having
// to navigate back through the onboarding flow.
//
// Guards:
// - in-flight: a single expiry storm only triggers one wallet prompt
// - cool-down: a rejected signature suppresses re-prompts for COOLDOWN_MS so a
//   declining user is not pestered every poll tick
export default function SessionExpiryRecovery() {
    const address = useAccountAddress()
    const siwe = useSiweSignature()

    const stateRef = useRef<{ inFlight: boolean; coolDownUntil: number; address: Address }>({
        inFlight: false,
        coolDownUntil: 0,
        address: ZERO_ADDRESS,
    })
    stateRef.current.address = address as Address

    const COOLDOWN_MS = 30_000

    useEffect(() => {
        const unsubscribe = subscribeSessionExpired(() => {
            const s = stateRef.current
            if (s.inFlight) return
            if (s.address === ZERO_ADDRESS) return
            if (Date.now() < s.coolDownUntil) return
            s.inFlight = true
            siwe.mutateAsync({ address: s.address })
                .catch(() => {
                    s.coolDownUntil = Date.now() + COOLDOWN_MS
                })
                .finally(() => {
                    s.inFlight = false
                })
        })
        return unsubscribe
    }, [siwe])

    return null
}
