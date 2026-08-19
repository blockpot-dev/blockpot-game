import { useQuery } from '@tanstack/react-query'
import { useBalance, useChainId } from 'wagmi'
import useDrawRead from '../read/useDrawRead'
import { useDrawHash } from '@/providers/BlockpotProvider'
import useFundsManagerAddress from './useFundsManagerAddress'

export default function useBalanceAllocations() {
    const chainId = useChainId()
    const { game, selectedGame } = useDrawRead()
    const drawHash = useDrawHash()
    const { fundsManagerAddress } = useFundsManagerAddress()
    const { data: contractBalance } = useBalance({
        chainId,
        address: fundsManagerAddress,
        scopeKey: drawHash,
    })

    const { data } = useQuery({
        queryKey: ['balanceAllocations', selectedGame, drawHash],
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
