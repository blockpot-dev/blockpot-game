import { lgoAbi } from '@/abi/lgoAbi'
import { ContractName } from '@/constants/contract-addresses'
import useReadContract from './useReadContract'

export default function useLGORead() {
    return useReadContract(ContractName.LGO, lgoAbi)
}
