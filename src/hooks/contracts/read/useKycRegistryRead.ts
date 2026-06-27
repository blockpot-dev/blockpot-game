import { kycRegistryAbi } from '@/abi/kycRegistryAbi'
import { ContractName } from '@/constants/contract-addresses'
import useReadContract from './useReadContract'

export default function useKycRegistryRead() {
    return useReadContract(ContractName.KYC_REGISTRY, kycRegistryAbi)
}
