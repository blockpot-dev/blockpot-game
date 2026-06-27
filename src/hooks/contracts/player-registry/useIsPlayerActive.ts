import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import usePlayerRegistryRead from '../read/usePlayerRegistryRead'

export default function useIsPlayerActive(address: Address) {
    const chainId = useChainId()
    const registry = usePlayerRegistryRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['isPlayerActive', chainId, address],
        queryFn: async () => registry.isActive([address]),
        enabled: address !== ZERO_ADDRESS,
    })

    return {
        isActive: data ?? false,
        isLoading,
    }
}
