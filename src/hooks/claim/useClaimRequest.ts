import { useMutation } from '@tanstack/react-query'
import { ApiError, authedFetch } from '@/api/gamingServiceClient'
import { PretxRequiredAction } from '@/hooks/player/usePretxDeposit'
import usePlayerActivityState from '@/hooks/player-summary/usePlayerActivityState'
import { useNativeCurrencyToUSDPrice } from '@/hooks/contracts/chainlink/useNativeCurrencyToUSDPrice'
import { useEurToUSDPrice } from '@/hooks/contracts/chainlink/useEurToUSDPrice'
import priceWeiEurMinor from '@/utilities/priceWeiEurMinor'
import { ClaimDecision, ClaimRequestInput } from './types'

type ClaimDecisionResponse = {
    decision: {
        allow: boolean
        reason: string
        required_action: PretxRequiredAction
        headroom_eur_minor?: number
    }
    operation_id?: string
}

function mapDecision(body: ClaimDecisionResponse): ClaimDecision {
    return {
        allow: body.decision.allow,
        reason: body.decision.reason,
        requiredAction: body.decision.required_action,
        headroomEurMinor: body.decision.headroom_eur_minor,
        operationId: body.operation_id,
    }
}

const EUR_FORMAT = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
})

// POSTs /v1/withdrawal/request — the URL stays "withdrawal" (server-facing
// identifier) but the player-facing primitive is "claim". On Allow=true the
// server has enqueued a `LGO.withdrawFor` operation; the returned operationId
// is what the UI tails for status. On Allow=false the response is a verbatim
// pretx decision the UI renders into the matching banner / dialog.
//
// The hook short-circuits before the pretx call when the requested claim
// would not fit inside the player's outflow-cap headroom
// (`claimEurMinor > state.outflow.headroomEurMinor`). That mirrors the
// on-chain `KYCRegistry.isCompliantForClaim` gate so the player sees the
// same HEADROOM_EXCEEDED outcome before signing — including when pretx is
// unauthenticated / unreachable. When part of the escrow still fits, the
// error message carries the partial-claim suggestion
// `min(escrowed, outflowHeadroom)`. Skipped on an unlimited outflow side
// (top tier) and when either Chainlink feed is missing.
export default function useClaimRequest() {
    const { state } = usePlayerActivityState()
    const ethUsd = useNativeCurrencyToUSDPrice()
    const eurUsd = useEurToUSDPrice()

    return useMutation<ClaimDecision, ApiError | Error, ClaimRequestInput>({
        mutationFn: async (input) => {
            const claimEurMinor = priceWeiEurMinor(input.amountWei, ethUsd, eurUsd)
            if (state && state.outflow.capEurMinor !== null && claimEurMinor !== null) {
                if (claimEurMinor > BigInt(state.outflow.headroomEurMinor)) {
                    const escrowedEurMinor = Math.max(0, state.cumWonEurMinor - state.cumClaimsEurMinor)
                    const suggestionEurMinor = Math.min(escrowedEurMinor, state.outflow.headroomEurMinor)
                    throw new ApiError({
                        status: 0,
                        code: 'HEADROOM_EXCEEDED',
                        message: suggestionEurMinor > 0
                            ? `Activity headroom exceeded. You can claim up to ${EUR_FORMAT.format(suggestionEurMinor / 100)} right now — verify to release the rest.`
                            : 'Activity headroom exceeded.',
                    })
                }
            }

            const body = await authedFetch<ClaimDecisionResponse>('/v1/withdrawal/request', {
                method: 'POST',
                body: {
                    fromWallet: input.fromWallet,
                    toWallet: input.toWallet,
                    amountWei: input.amountWei.toString(),
                    chainId: input.chainId,
                    in_weth: input.inWeth,
                },
            })
            return mapDecision(body)
        },
    })
}
