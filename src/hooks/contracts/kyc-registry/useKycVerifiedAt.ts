import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import useKycRegistryRead from '../read/useKycRegistryRead'

export default function useKycVerifiedAt(address: Address) {
    const chainId = useChainId()
    const registry = useKycRegistryRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['kyc:verifiedAt', chainId, address],
        queryFn: async () => registry.verifiedAt([address]),
        enabled: address !== ZERO_ADDRESS,
    })

    return {
        verifiedAt: data ?? 0n,
        isLoading,
    }
}
