import { useQuery } from '@tanstack/react-query'
import { useBalance, useChainId } from 'wagmi'
import useLotteryRead from '../read/useLotteryRead'
import { useLotteryHash } from '@/providers/BlockpotProvider'
import useFundsManagerAddress from './useFundsManagerAddress'

export default function useBalanceAllocations() {
    const chainId = useChainId()
    const { game, selectedGame } = useLotteryRead()
    const lotteryHash = useLotteryHash()
    const { fundsManagerAddress } = useFundsManagerAddress()
    const { data: contractBalance } = useBalance({
        chainId,
        address: fundsManagerAddress,
        scopeKey: lotteryHash,
    })

    const { data } = useQuery({
        queryKey: ['balanceAllocations', selectedGame, lotteryHash],
        queryFn: async () => {
            return await game.balances()
        }
    })

    return {
        pot: data?.pot ?? 0n,
        nextPot: data?.nextPot ?? 0n,
        parentGame: data?.parentGame ?? 0n,
        contractBalance: contractBalance?.value ?? 0n,
        fundsManagerAddress,
    }
}
