import { Address } from 'viem'
import {
    ApiError,
    authedFetch,
    getToken,
    isServiceConfigured,
    NO_SESSION_TOKEN,
    SESSION_EXPIRED,
} from '@/api/gamingServiceClient'

export type PretxRequiredAction =
    | 'KYC_UPGRADE'
    | 'SELF_EXCLUDED'
    | 'SANCTIONS_BLOCK'
    | 'SYBIL_BLOCK'
    | 'GEO_BLOCK'
    | 'LIMIT_EXCEEDED'
    | 'HEADROOM_EXCEEDED'
    | 'ENTRY_BLOCKED'
    | 'SEQUENCER_DOWN'
    | 'NONE'

export type PretxDecision = {
    allow: boolean
    reason: string
    requiredAction: PretxRequiredAction
    pendingCddEurMinor: number
    // Remaining room under the directional cap on HEADROOM_EXCEEDED.
    headroomEurMinor?: number
    // ISO timestamp the on-chain entry block expires, on ENTRY_BLOCKED.
    retryAt?: string
}

type PretxDecisionResponse = {
    allow: boolean
    reason: string
    required_action: PretxRequiredAction
    pending_cdd_eur_minor: number
    headroom_eur_minor?: number
    retry_at?: string
}

export type PretxDepositInput = {
    chainId: number
    walletAddress: Address
    amountWei: bigint
}

// Calls task-10's /v1/pretx/deposit gate. Returns `null` when the backend
// isn't configured, the player has no active session (so the gate cannot run),
// or the backend is unreachable / returns 404 — callers should treat null as
// "no pre-tx verdict available" and fall back to their existing on-chain
// checks rather than blocking the entry on transient backend issues.
export async function evaluatePretxDeposit(input: PretxDepositInput): Promise<PretxDecision | null> {
    if (!isServiceConfigured()) return null
    if (!getToken()) return null
    try {
        const body = await authedFetch<PretxDecisionResponse>('/v1/pretx/deposit', {
            method: 'POST',
            body: {
                chainId: input.chainId,
                walletAddress: input.walletAddress,
                amountWei: input.amountWei.toString(),
                clientSignals: {},
            },
        })
        return {
            allow: body.allow,
            reason: body.reason,
            requiredAction: body.required_action,
            pendingCddEurMinor: body.pending_cdd_eur_minor,
            headroomEurMinor: body.headroom_eur_minor,
            retryAt: body.retry_at,
        }
    } catch (e) {
        if (e instanceof ApiError) {
            if (e.status === 404) return null
            // No-token / session-expired => gate can't run; on-chain guards cover it.
            if (e.code === NO_SESSION_TOKEN || e.code === SESSION_EXPIRED) return null
            throw e
        }
        // Network / parse errors fall through — the on-chain guards are still in place.
        return null
    }
}
