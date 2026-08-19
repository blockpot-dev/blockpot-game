import { operatorAbi } from '@/abi/operatorAbi'
import { ContractName } from '@/constants/contract-addresses'
import useReadContract from './useReadContract'

export default function useOperatorRead() {
    return useReadContract(ContractName.OPERATOR, operatorAbi)
}
