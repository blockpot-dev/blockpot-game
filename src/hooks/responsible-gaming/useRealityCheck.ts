import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Address } from 'viem'
import { authedFetch, isServiceConfigured } from '@/api/gamingServiceClient'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { usePlayerSession } from '@/providers/PlayerSessionProvider'
import { ZERO_ADDRESS } from '@/web3/constants'

export type RealityCheckConfig = {
    intervalMinutes: number
    enabled: boolean
}

type RealityCheckResponse = {
    interval_minutes: number
    enabled: boolean
}

export const REALITY_CHECK_MIN_MINUTES = 15
export const REALITY_CHECK_MAX_MINUTES = 240
export const REALITY_CHECK_DEFAULT_MINUTES = 60

function mapConfig(body: RealityCheckResponse): RealityCheckConfig {
    return {
        intervalMinutes: body.interval_minutes,
        enabled: body.enabled,
    }
}

async function fetchConfig(): Promise<RealityCheckConfig> {
    const body = await authedFetch<RealityCheckResponse>('/v1/rg/reality-check')
    return mapConfig(body)
}

export const realityCheckQueryKey = (address: Address | null) => ['realityCheck', address] as const

const POLL_INTERVAL_MS = 5 * 60 * 1000

export default function useRealityCheck() {
    const address = useAccountAddress()
    const { activeToken } = usePlayerSession()
    const enabled = address !== ZERO_ADDRESS && isServiceConfigured() && !!activeToken()

    const query = useQuery({
        queryKey: realityCheckQueryKey(enabled ? (address as Address) : null),
        queryFn: fetchConfig,
        enabled,
        refetchInterval: POLL_INTERVAL_MS,
        staleTime: POLL_INTERVAL_MS / 2,
    })

    return {
        config: query.data,
        isLoading: query.isLoading,
        error: query.error,
    }
}

export type UpdateRealityCheckPayload = {
    intervalMinutes: number
    enabled: boolean
}

async function putConfig(payload: UpdateRealityCheckPayload): Promise<RealityCheckConfig> {
    const body = await authedFetch<RealityCheckResponse>('/v1/rg/reality-check', {
        method: 'PUT',
        body: {
            interval_minutes: payload.intervalMinutes,
            enabled: payload.enabled,
        },
    })
    return mapConfig(body)
}

export function useUpdateRealityCheck() {
    const address = useAccountAddress()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: UpdateRealityCheckPayload) => {
            if (address === ZERO_ADDRESS) throw new Error('wallet not connected')
            return putConfig(payload)
        },
        onSuccess: (config) => {
            queryClient.setQueryData(realityCheckQueryKey(address as Address), config)
        },
    })
}
