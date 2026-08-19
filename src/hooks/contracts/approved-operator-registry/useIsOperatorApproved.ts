import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { ZERO_ADDRESS } from '@/web3/constants'
import useApprovedOperatorRegistryRead from './useApprovedOperatorRegistryRead'

export default function useIsOperatorApproved() {
    const chainId = useChainId()
    const complianceRegistry = useApprovedOperatorRegistryRead()
    const operatorAddress = getContractAddress(chainId, ContractName.OPERATOR)

    const { data, isLoading } = useQuery({
        queryKey: ['isOperatorApproved', chainId, operatorAddress],
        queryFn: async () => complianceRegistry.isWhitelisted([operatorAddress]),
        enabled: operatorAddress !== ZERO_ADDRESS,
    })

    return {
        isWhitelisted: data ?? false,
        isLoading,
    }
}
