import { approvedOperatorRegistryAbi } from '@/abi/approvedOperatorRegistryAbi'
import { ContractName } from '@/constants/contract-addresses'
import useReadContract from '../read/useReadContract'

export default function useApprovedOperatorRegistryRead() {
    return useReadContract(ContractName.APPROVED_OPERATOR_REGISTRY, approvedOperatorRegistryAbi).read
}
