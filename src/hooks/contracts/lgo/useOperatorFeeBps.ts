import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import useLGORead from '../read/useLGORead'

export default function useOperatorFeeBps() {
    const chainId = useChainId()
    const lgo = useLGORead().read

    const { data, isLoading } = useQuery({
        queryKey: ['lgo:operatorFeeBps', chainId],
        queryFn: async () => lgo.operatorFeeBps(),
    })

    return {
        operatorFeeBps: data ?? 0n,
        isLoading,
    }
}
