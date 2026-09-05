import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { authedFetch } from '@/api/gamingServiceClient'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { ZERO_ADDRESS } from '@/web3/constants'

// The two pieces of verification state the server owns (BLO-679).
//
// Everything else the silent-tier surfaces need — tier, cumulative activity,
// headroom — is derived client-side from chain reads in usePlayerActivityState.
// There is no player-summary endpoint and there is not going to be one. These
// two cannot be derived: whether the player crossed 90% of a cap *and has not
// dismissed that nudge*, and whether they have ever been asked to verify, are
// decisions the service makes and remembers.

export type CapProximity = {
    ratio: number
    /** True at exactly 0.90 as well as above it — the server comparison is inclusive. */
    crossed90Pct: boolean
    /** Dismissal key, e.g. "t0_stake_90pct". Opaque to the client; pass it back verbatim. */
    threshold: string
    dismissed: boolean
}

export type VerificationState = {
    /**
     * Null when there is no cap to be near: no active tier, or a tier whose
     * caps are unset or unlimited. Branch on null, never on `ratio === 0` —
     * a player at 0% of a real cap and a player with no cap at all are
     * different states and only one of them can ever produce a nudge.
     */
    capProximity: CapProximity | null
    /** Null until the player first hits any verification surface. Gates Surface 4. */
    firstVerificationContactAt: string | null
}

type VerificationStateResponse = {
    cap_proximity: {
        ratio: number
        crossed_90pct: boolean
        threshold: string
        dismissed: boolean
    } | null
    first_verification_contact_at: string | null
}

function toVerificationState(body: VerificationStateResponse): VerificationState {
    return {
        capProximity: body.cap_proximity
            ? {
                ratio: body.cap_proximity.ratio,
                crossed90Pct: body.cap_proximity.crossed_90pct,
                threshold: body.cap_proximity.threshold,
                dismissed: body.cap_proximity.dismissed,
            }
            : null,
        firstVerificationContactAt: body.first_verification_contact_at,
    }
}

export function verificationStateKey(chainId: number, address: string) {
    return ['verificationState', chainId, address] as const
}

export default function useVerificationState() {
    const chainId = useChainId()
    const address = useAccountAddress()
    const enabled = address !== ZERO_ADDRESS

    return useQuery<VerificationState>({
        queryKey: verificationStateKey(chainId, address),
        queryFn: async () => {
            const body = await authedFetch<VerificationStateResponse>('/v1/player/verification-state')
            return toVerificationState(body)
        },
        enabled,
    })
}

/**
 * Stamps first contact. Idempotent server-side via COALESCE, so calling it on
 * every surface open is correct and the timestamp never moves.
 */
export function useRecordVerificationContact() {
    const chainId = useChainId()
    const address = useAccountAddress()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            await authedFetch('/v1/player/verification-contact', { method: 'POST' })
        },
        onSuccess: () => {
            // Surface 4 appears off the back of this, so the state it reads
            // must not stay stale until the next natural refetch.
            void queryClient.invalidateQueries({ queryKey: verificationStateKey(chainId, address) })
        },
    })
}

/**
 * Dismisses one 90% nudge. `threshold` is the opaque key from
 * `capProximity.threshold` — do not construct it here; the server rejects a key
 * it did not issue with a 400, which is what stops a typo becoming a nudge that
 * reappears forever.
 */
export function useDismissNudge() {
    const chainId = useChainId()
    const address = useAccountAddress()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (threshold: string) => {
            await authedFetch(`/v1/player/nudges/${encodeURIComponent(threshold)}/dismiss`, {
                method: 'POST',
            })
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: verificationStateKey(chainId, address) })
        },
    })
}
