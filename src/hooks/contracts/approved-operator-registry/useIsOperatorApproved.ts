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
        // `undefined` while loading or after a read error, so callers can
        // tell "confirmed not approved" (false) from "not known yet" and avoid
        // flashing a site-wide closure on a transient RPC failure (BLO-754).
        // Entry gating treats undefined as closed (fail-closed).
        isWhitelisted: data as boolean | undefined,
        isLoading,
    }
}
