import { Address } from 'viem'
import { useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { ZERO_ADDRESS } from '@/web3/constants'
import useDrawRead from '../read/useDrawRead'

// Derives the funds-manager address for the selected game directly from the
// lottery contract (`lottery.fundsManager()`) rather than the static
// CHAINS_CONFIG-synced address. This keeps the Transparency panel correct even
// when the synced `fundsManager` key is missing (see task 102).
export default function useFundsManagerAddress() {
    const chainId = useChainId()
    const { game, selectedGame } = useDrawRead()

    const { data, isLoading } = useQuery({
        queryKey: ['fundsManagerAddress', selectedGame, chainId],
        queryFn: async () => game.fundsManager() as Promise<Address>,
    })

    return {
        fundsManagerAddress: data ?? ZERO_ADDRESS,
        isLoading,
    }
}
