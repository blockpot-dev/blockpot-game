import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import useAvailablePublicClient from '@/hooks/web3/useAvailablePublicClient'
import { Abi } from 'abitype'
import { useMemo } from 'react'
import { getContract } from 'viem'
import { useChainId } from 'wagmi'

export default function useReadContract<TAbi extends Abi | readonly unknown[]>(name: ContractName, abi: TAbi) {
    const chainId = useChainId()
    const publicClient = useAvailablePublicClient()

    const contract = useMemo(() => getContract({
        address: getContractAddress(chainId, name),
        abi,
        client: publicClient,
    }), [chainId, name, abi, publicClient])
    return contract
}