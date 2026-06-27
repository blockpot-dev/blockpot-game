import { complianceRegistryAbi } from '@/abi/complianceRegistryAbi'
import { ContractName } from '@/constants/contract-addresses'
import useReadContract from '../read/useReadContract'

export default function useComplianceRegistryRead() {
    return useReadContract(ContractName.COMPLIANCE_REGISTRY, complianceRegistryAbi).read
}
