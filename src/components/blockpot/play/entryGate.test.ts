import { describe, expect, it } from 'vitest'
import { deriveEntryGate } from './entryGate'
import { PlayerStatus } from '@/hooks/contracts/player-registry/usePlayerStatus'

// BLO-734: a suspended/banned player must NOT be routed into registration
// mode (an enabled REGISTER button whose tx reverts as "Transaction
// cancelled") — they get a disabled entry CTA with a player-appropriate
// reason instead. Registration is only for players the registry has never
// seen (status NONE).

const base = {
    isOperatorApproved: true,
    isStatusLoading: false,
    isActiveLoading: false,
}

describe('deriveEntryGate', () => {
    it('routes an unregistered player (NONE) to registration', () => {
        const gate = deriveEntryGate({ ...base, playerStatus: PlayerStatus.NONE })
        expect(gate.needsRegistration).toBe(true)
        expect(gate.accessReason).toBeUndefined()
    })

    it('suspended player: no registration, disabled with review copy', () => {
        const gate = deriveEntryGate({ ...base, playerStatus: PlayerStatus.SUSPENDED })
        expect(gate.needsRegistration).toBe(false)
        expect(gate.accessReason).toMatch(/under review/i)
        // Never leak internal state words to players.
        expect(gate.accessReason).not.toMatch(/suspend|closure|blocked/i)
    })

    it('banned player: no registration, disabled with closed-account copy', () => {
        const gate = deriveEntryGate({ ...base, playerStatus: PlayerStatus.BANNED })
        expect(gate.needsRegistration).toBe(false)
        expect(gate.accessReason).toMatch(/closed/i)
    })

    it('active player: no registration, no reason', () => {
        const gate = deriveEntryGate({ ...base, playerStatus: PlayerStatus.ACTIVE })
        expect(gate.needsRegistration).toBe(false)
        expect(gate.accessReason).toBeUndefined()
    })

    it('holds registration while the status read is loading', () => {
        const gate = deriveEntryGate({ ...base, playerStatus: PlayerStatus.NONE, isStatusLoading: true })
        expect(gate.needsRegistration).toBe(false)
    })

    it('never registers against a non-whitelisted operator', () => {
        const gate = deriveEntryGate({ ...base, isOperatorApproved: false, playerStatus: PlayerStatus.NONE })
        expect(gate.needsRegistration).toBe(false)
    })
})
