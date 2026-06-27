import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Address } from 'viem'
import { useChainId } from 'wagmi'
import { isServiceConfigured, publicFetch } from '@/api/gamingServiceClient'
import { clearOperationId } from './useRegisterPlayer'

export type OperationStatus =
    | 'PENDING'
    | 'SIGNING'
    | 'SUBMITTED'
    | 'CONFIRMED'
    | 'REVERTED'
    | 'RETRYABLE'
    | 'FAILED'

export type OperationView = {
    id: string
    kind: string
    chainId: number
    status: OperationStatus
    attempt: number
    txHash?: string
    blockNumber?: number
    receiptStatus?: number
    error?: string
    createdAt: string
    updatedAt: string
}

const TERMINAL: OperationStatus[] = ['CONFIRMED', 'REVERTED', 'FAILED']

function fetchOperation(operationId: string): Promise<OperationView> {
    return publicFetch<OperationView>(`/v1/operations/${operationId}`)
}

// Polls the gaming service for an operation's current status. When the op
// reaches CONFIRMED, invalidates `isPlayerActive` so the registration banner
// unmounts in the next render.
export default function useRegistrationOperation(operationId: string | null, address: Address | undefined) {
    const chainId = useChainId()
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['operation', operationId],
        queryFn: () => fetchOperation(operationId as string),
        enabled: !!operationId && isServiceConfigured(),
        refetchInterval: (q) => {
            const data = q.state.data as OperationView | undefined
            return data && TERMINAL.includes(data.status) ? false : 2000
        },
    })

    useEffect(() => {
        const status = query.data?.status
        if (!status || !address) return
        if (status === 'CONFIRMED') {
            queryClient.invalidateQueries({ queryKey: ['isPlayerActive', chainId, address] })
            clearOperationId(chainId, address)
        }
        if (status === 'REVERTED' || status === 'FAILED') {
            clearOperationId(chainId, address)
        }
    }, [query.data?.status, chainId, address, queryClient])

    return query
}
