import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { Abi } from 'abitype'
import { getContract } from 'viem'
import { useChainId, useWalletClient } from 'wagmi'

export default function useWriteContract<TAbi extends Abi | readonly unknown[]>(name: ContractName, abi: TAbi) {
    const chainId = useChainId()
    const { data: walletClient } = useWalletClient()

    if (!walletClient) {
        return undefined
    }

    const contract = getContract({
        address: getContractAddress(chainId, name),
        abi,
        client: walletClient,
    })

    return contract
}