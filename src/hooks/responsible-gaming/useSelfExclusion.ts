import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Address } from 'viem'
import { authedFetch, isServiceConfigured } from '@/api/gamingServiceClient'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { usePlayerSession } from '@/providers/PlayerSessionProvider'
import { ZERO_ADDRESS } from '@/web3/constants'

export type SelfExclusionDuration = '24h' | '7d' | '30d' | '6mo' | 'permanent'
export type SelfExclusionAppliedBy = 'player' | 'mlro'

export type SelfExclusionRecord = {
    id: string
    duration: SelfExclusionDuration
    startsAt: string
    endsAt: string | null
    appliedBy: SelfExclusionAppliedBy
    reason?: string
    liftedAt?: string
}

export type SelfExclusionState = {
    active: SelfExclusionRecord | null
    history: SelfExclusionRecord[]
}

type SelfExclusionRecordResponse = {
    id: string
    duration: SelfExclusionDuration
    starts_at: string
    ends_at: string | null
    applied_by: SelfExclusionAppliedBy
    reason?: string
    lifted_at?: string
}

type SelfExclusionStateResponse = {
    active: SelfExclusionRecordResponse | null
    history: SelfExclusionRecordResponse[]
}

function mapRecord(body: SelfExclusionRecordResponse): SelfExclusionRecord {
    return {
        id: body.id,
        duration: body.duration,
        startsAt: body.starts_at,
        endsAt: body.ends_at,
        appliedBy: body.applied_by,
        reason: body.reason,
        liftedAt: body.lifted_at,
    }
}

function mapState(body: SelfExclusionStateResponse): SelfExclusionState {
    return {
        active: body.active ? mapRecord(body.active) : null,
        history: (body.history ?? []).map(mapRecord),
    }
}

async function fetchSelfExclusion(): Promise<SelfExclusionState> {
    const body = await authedFetch<SelfExclusionStateResponse>('/v1/self-exclusion/current')
    return mapState(body)
}

export const selfExclusionQueryKey = (address: Address | null) => ['selfExclusion', address] as const

const POLL_INTERVAL_MS = 60_000

export default function useSelfExclusion() {
    const address = useAccountAddress()
    const queryClient = useQueryClient()
    const { activeToken } = usePlayerSession()
    const enabled = address !== ZERO_ADDRESS && isServiceConfigured() && !!activeToken()

    const query = useQuery({
        queryKey: selfExclusionQueryKey(enabled ? (address as Address) : null),
        queryFn: fetchSelfExclusion,
        enabled,
        refetchInterval: POLL_INTERVAL_MS,
        refetchOnWindowFocus: true,
        staleTime: POLL_INTERVAL_MS / 2,
    })

    return {
        state: query.data,
        active: query.data?.active ?? null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: selfExclusionQueryKey(address as Address),
        }),
    }
}
