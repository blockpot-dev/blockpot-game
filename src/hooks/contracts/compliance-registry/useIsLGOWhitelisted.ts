import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { ZERO_ADDRESS } from '@/web3/constants'
import useComplianceRegistryRead from './useComplianceRegistryRead'

export default function useIsLGOWhitelisted() {
    const chainId = useChainId()
    const complianceRegistry = useComplianceRegistryRead()
    const lgoAddress = getContractAddress(chainId, ContractName.LGO)

    const { data, isLoading } = useQuery({
        queryKey: ['isLGOWhitelisted', chainId, lgoAddress],
        queryFn: async () => complianceRegistry.isWhitelisted([lgoAddress]),
        enabled: lgoAddress !== ZERO_ADDRESS,
    })

    return {
        isWhitelisted: data ?? false,
        isLoading,
    }
}
