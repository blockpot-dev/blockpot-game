import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import useLGORead from '../read/useLGORead'

export default function usePlayerBalances(address: Address) {
    const chainId = useChainId()
    const lgo = useLGORead().read

    const { data, isLoading } = useQuery({
        queryKey: ['lgo:balances', chainId, address],
        queryFn: async () => ({
            eth: await lgo.balanceEth([address]),
            weth: await lgo.balanceWeth([address]),
        }),
        enabled: address !== ZERO_ADDRESS,
    })

    return {
        eth: data?.eth ?? 0n,
        weth: data?.weth ?? 0n,
        isLoading,
    }
}
