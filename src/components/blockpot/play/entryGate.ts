import { PlayerStatus } from '@/hooks/contracts/player-registry/usePlayerStatus'

export type EntryGateInputs = {
    isOperatorApproved: boolean
    playerStatus: PlayerStatus
    isStatusLoading: boolean
    isActiveLoading: boolean
}

export type EntryGate = {
    needsRegistration: boolean
    // Player-facing copy for a registry status that forbids entering.
    // Deliberately avoids internal vocabulary (suspended, closure, blocked).
    accessReason?: string
    // True when the reason should be followed by a support link (SUPPORT_URL).
    supportLink?: boolean
}

// BLO-734: `!isActive` alone cannot route to registration — SUSPENDED and
// BANNED players are also not active, and offering them REGISTER produces a
// reverting tx surfaced as "Transaction cancelled". Only a wallet the
// registry has never seen (NONE) registers; non-entitled statuses disable
// the entry CTA with a reason.
export function deriveEntryGate(inputs: EntryGateInputs): EntryGate {
    const { isOperatorApproved, playerStatus, isStatusLoading, isActiveLoading } = inputs
    if (!isOperatorApproved || isStatusLoading || isActiveLoading) {
        return { needsRegistration: false }
    }
    switch (playerStatus) {
    case PlayerStatus.NONE:
        return { needsRegistration: true }
    case PlayerStatus.SUSPENDED:
        return {
            needsRegistration: false,
            accessReason: 'Your account is under review. Entries are paused until verification is complete.',
        }
    case PlayerStatus.BANNED:
        return {
            needsRegistration: false,
            accessReason: 'This account has been closed. If you believe this is an error, contact support.',
            supportLink: true,
        }
    default:
        return { needsRegistration: false }
    }
}
