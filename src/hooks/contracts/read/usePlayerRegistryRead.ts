import { playerRegistryAbi } from '@/abi/playerRegistryAbi'
import { ContractName } from '@/constants/contract-addresses'
import useReadContract from './useReadContract'

export default function usePlayerRegistryRead() {
    return useReadContract(ContractName.PLAYER_REGISTRY, playerRegistryAbi)
}
