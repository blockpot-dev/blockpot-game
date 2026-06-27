import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import useKycRegistryRead from '../read/useKycRegistryRead'

export default function useKycTier(address: Address) {
    const chainId = useChainId()
    const registry = useKycRegistryRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['kyc:tierOf', chainId, address],
        queryFn: async () => registry.tierOf([address]),
        enabled: address !== ZERO_ADDRESS,
    })

    return {
        tier: Number(data ?? 0),
        isLoading,
    }
}
