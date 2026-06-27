import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import usePlayerRegistryRead from '../read/usePlayerRegistryRead'

export enum PlayerStatus {
    NONE = 0,
    ACTIVE = 1,
    SUSPENDED = 2,
    BANNED = 3,
}

export default function usePlayerStatus(address: Address) {
    const chainId = useChainId()
    const registry = usePlayerRegistryRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['playerStatus', chainId, address],
        queryFn: async () => registry.statusOf([address]),
        enabled: address !== ZERO_ADDRESS,
    })

    return {
        status: (data ?? PlayerStatus.NONE) as PlayerStatus,
        isLoading,
    }
}
