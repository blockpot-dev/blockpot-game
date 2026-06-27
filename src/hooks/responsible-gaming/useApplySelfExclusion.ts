import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Address } from 'viem'
import { authedFetch } from '@/api/gamingServiceClient'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { ZERO_ADDRESS } from '@/web3/constants'
import {
    SelfExclusionDuration,
    selfExclusionQueryKey,
} from './useSelfExclusion'

export type ApplySelfExclusionPayload = {
    duration: SelfExclusionDuration
    reason?: string
}

export type ApplySelfExclusionResult = {
    id: string
    startsAt: string
    endsAt: string | null
}

type ApplyResponse = {
    id: string
    starts_at: string
    ends_at: string | null
}

async function postApply(payload: ApplySelfExclusionPayload): Promise<ApplySelfExclusionResult> {
    const body = await authedFetch<ApplyResponse>('/v1/self-exclusion', {
        method: 'POST',
        body: {
            duration: payload.duration,
            reason: payload.reason,
        },
    })
    return {
        id: body.id,
        startsAt: body.starts_at,
        endsAt: body.ends_at,
    }
}

export default function useApplySelfExclusion() {
    const address = useAccountAddress()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: ApplySelfExclusionPayload) => {
            if (address === ZERO_ADDRESS) {
                throw new Error('wallet not connected')
            }
            return postApply(payload)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: selfExclusionQueryKey(address as Address) })
            void queryClient.invalidateQueries({ queryKey: ['playerSummary', address] })
        },
    })
}
