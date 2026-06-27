import { useQuery } from '@tanstack/react-query'
import { isServiceConfigured, publicFetch } from '@/api/gamingServiceClient'
import { OperationView } from '@/hooks/contracts/player-registry/useRegistrationOperation'

const TERMINAL = ['CONFIRMED', 'REVERTED', 'FAILED'] as const

function fetchOperation(operationId: string): Promise<OperationView> {
    return publicFetch<OperationView>(`/v1/operations/${operationId}`)
}

// Polls the gaming-service for an in-flight claim op. The parent surface uses
// the returned status to flip the button/toast state.
export default function useClaimOperation(operationId: string | null) {
    return useQuery({
        queryKey: ['operation', operationId],
        queryFn: () => fetchOperation(operationId as string),
        enabled: !!operationId && isServiceConfigured(),
        refetchInterval: (q) => {
            const data = q.state.data as OperationView | undefined
            return data && (TERMINAL as readonly string[]).includes(data.status) ? false : 2000
        },
    })
}
