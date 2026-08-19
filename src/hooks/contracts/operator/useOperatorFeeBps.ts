import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import useOperatorRead from '../read/useOperatorRead'

export default function useOperatorFeeBps() {
    const chainId = useChainId()
    const lgo = useOperatorRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['operator:operatorFeeBps', chainId],
        queryFn: async () => lgo.operatorFeeBps(),
    })

    return {
        operatorFeeBps: data ?? 0n,
        isLoading,
    }
}
