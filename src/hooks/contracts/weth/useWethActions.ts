import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { wethAbi } from '@/abi/wethAbi'
import useTrackedContractWrite from '@/hooks/web3/useTrackedContractWrite'
import { useChainId } from 'wagmi'
import { formatEther } from 'viem'

export default function useWethActions() {
    const chainId = useChainId()
    const { writeAsync: withdrawWriteAsync } = useTrackedContractWrite({
        address: getContractAddress(chainId, ContractName.WETH),
        abi: wethAbi,
        functionName: 'withdraw'
    })

    const { writeAsync: depositWriteAsync } = useTrackedContractWrite({
        address: getContractAddress(chainId, ContractName.WETH),
        abi: wethAbi,
        functionName: 'deposit'
    })
    
    const wrap = async (amount: bigint) => {
        return depositWriteAsync(
            [],
            `Wrapping ${formatEther(amount)} ETH`,
            { value: amount }
        )
    }

    const unwrap = async (amount: bigint) => {
        return withdrawWriteAsync(
            [amount],
            `Unwrapping ${formatEther(amount)} ETH`
        )
    }

    return {
        wrap,
        unwrap
    }
}