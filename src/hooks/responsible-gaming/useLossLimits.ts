import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Address } from 'viem'
import { authedFetch, isServiceConfigured } from '@/api/gamingServiceClient'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { usePlayerSession } from '@/providers/PlayerSessionProvider'
import { ZERO_ADDRESS } from '@/web3/constants'

export type LossLimitPeriod = 'daily' | 'weekly' | 'monthly'

export type LossLimit = {
    amountEurMinor: number
    effectiveFrom: string
}

export type PendingLossLimit = {
    id: string
    period: LossLimitPeriod
    newAmountEurMinor: number
    direction: 'increase' | 'decrease'
    effectiveAt: string
}

export type LossLimitsState = {
    daily?: LossLimit
    weekly?: LossLimit
    monthly?: LossLimit
    pending: PendingLossLimit[]
}

type LossLimitResponse = {
    amount_eur_minor: number
    effective_from: string
}

type PendingLossLimitResponse = {
    id: string
    period: LossLimitPeriod
    new_amount_eur_minor: number
    direction: 'increase' | 'decrease'
    effective_at: string
}

type LossLimitsResponse = {
    daily?: LossLimitResponse
    weekly?: LossLimitResponse
    monthly?: LossLimitResponse
    pending: PendingLossLimitResponse[]
}

function mapLimit(body: LossLimitResponse | undefined): LossLimit | undefined {
    if (!body) return undefined
    return { amountEurMinor: body.amount_eur_minor, effectiveFrom: body.effective_from }
}

function mapPending(body: PendingLossLimitResponse): PendingLossLimit {
    return {
        id: body.id,
        period: body.period,
        newAmountEurMinor: body.new_amount_eur_minor,
        direction: body.direction,
        effectiveAt: body.effective_at,
    }
}

function mapState(body: LossLimitsResponse): LossLimitsState {
    return {
        daily: mapLimit(body.daily),
        weekly: mapLimit(body.weekly),
        monthly: mapLimit(body.monthly),
        pending: (body.pending ?? []).map(mapPending),
    }
}

async function fetchLimits(): Promise<LossLimitsState> {
    const body = await authedFetch<LossLimitsResponse>('/v1/rg/loss-limits')
    return mapState(body)
}

export const lossLimitsQueryKey = (address: Address | null) => ['lossLimits', address] as const

const POLL_INTERVAL_MS = 60_000

export default function useLossLimits() {
    const address = useAccountAddress()
    const { activeToken } = usePlayerSession()
    const enabled = address !== ZERO_ADDRESS && isServiceConfigured() && !!activeToken()

    const query = useQuery({
        queryKey: lossLimitsQueryKey(enabled ? (address as Address) : null),
        queryFn: fetchLimits,
        enabled,
        refetchInterval: POLL_INTERVAL_MS,
        staleTime: POLL_INTERVAL_MS / 2,
    })

    return {
        state: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}

export type SetLossLimitPayload = {
    period: LossLimitPeriod
    amountEurMinor: number
}

export type SetLossLimitResult = {
    period: LossLimitPeriod
    direction: 'immediate' | 'pending'
    effectiveAt: string
}

type SetLossLimitResponseRaw = {
    period: LossLimitPeriod
    direction: 'immediate' | 'pending'
    effective_at: string
}

async function postSetLimit(payload: SetLossLimitPayload): Promise<SetLossLimitResult> {
    const body = await authedFetch<SetLossLimitResponseRaw>('/v1/rg/loss-limits', {
        method: 'POST',
        body: {
            period: payload.period,
            amount_eur_minor: payload.amountEurMinor,
        },
    })
    return {
        period: body.period,
        direction: body.direction,
        effectiveAt: body.effective_at,
    }
}

export function useSetLossLimit() {
    const address = useAccountAddress()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: SetLossLimitPayload) => {
            if (address === ZERO_ADDRESS) throw new Error('wallet not connected')
            return postSetLimit(payload)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: lossLimitsQueryKey(address as Address) })
        },
    })
}

async function deletePending(id: string): Promise<void> {
    await authedFetch(`/v1/rg/loss-limits/pending/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        expectEmpty: true,
    })
}

export function useCancelPendingLossLimit() {
    const address = useAccountAddress()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            if (address === ZERO_ADDRESS) throw new Error('wallet not connected')
            await deletePending(id)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: lossLimitsQueryKey(address as Address) })
        },
    })
}
