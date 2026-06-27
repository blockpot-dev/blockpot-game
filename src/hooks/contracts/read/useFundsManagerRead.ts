import { fundsManagerAbi } from '@/abi/fundsManagerAbi'
import { ContractName } from '@/constants/contract-addresses'
import useReadContract from './useReadContract'

export default function useFundsManagerRead() {
    return useReadContract(ContractName.FUNDS_MANAGER_MAIN, fundsManagerAbi)
}