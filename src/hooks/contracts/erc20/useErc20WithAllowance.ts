import { Address, erc20Abi, getContract } from 'viem'
import { useAccount, useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import useEventBlockNumber from '../../utilities/useEventsBlockNumber'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { ZERO_ADDRESS } from '@/web3/constants'
import { formatFixedMaxDecimals } from '@/utilities/formatters'
import useTrackedContractWrite from '@/hooks/web3/useTrackedContractWrite'
import useAvailablePublicClient from '@/hooks/web3/useAvailablePublicClient'

export default function useErc20WithAllowance(token: ContractName, spender: Address) {
    const chainId = useChainId()
    const publicClient = useAvailablePublicClient()
    const contractAddress = getContractAddress(chainId, token)
    const { address } = useAccount()

    const approveWrite = useTrackedContractWrite({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'approve'
    })

    const eventBlockNumber = useEventBlockNumber({
        address: contractAddress,
        abi: erc20Abi,
        events: ['Transfer', 'Approval']
    })

    const erc20 = getContract({
        address: contractAddress,
        abi: erc20Abi,
        client: publicClient,
    })

    const owner = address ?? ZERO_ADDRESS
    
    const { data } = useQuery({
        queryKey: ['erc20', token, eventBlockNumber.toString(), chainId, owner, spender],
        queryFn: async () => {
            const allowance = await erc20.read.allowance([owner, spender])
            const balance = await erc20.read.balanceOf([owner])
            const decimals = await erc20.read.decimals()
            const symbol = await erc20.read.symbol()
            return {
                allowance,
                balance,
                decimals,
                symbol
            }
        }
    })

    const approve = (amount: bigint) => {
        approveWrite.write([spender, amount], `Approve ${formatFixedMaxDecimals(data?.balance ?? 0n, data?.decimals ?? 18, 4)} ${data?.symbol ?? ''}`.trimEnd())
    }

    return {
        balance: data?.balance ?? 0n,
        allowance: data?.allowance ?? 0n,
        eventBlockNumber,
        approve,
        approveLoading: approveWrite.isLoading,
    }
}

export type ERC20WithAllowance = ReturnType<typeof useErc20WithAllowance>
export interface BalanceAndAllowance {
    balance: bigint,
    allowance: bigint
}