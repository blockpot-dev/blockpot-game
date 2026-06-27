import { useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { GameType } from '@/providers/SelectedGameProvider'
import useLotteryRead from '../read/useLotteryRead'

export default function useGameLatestRoundIndex(gameType: GameType): number | undefined {
    const chainId = useChainId()
    const { game } = useLotteryRead(gameType)

    const { data } = useQuery({
        queryKey: ['gameLatestRoundIndex', gameType, chainId],
        queryFn: async () => {
            return await game.currentRoundIndex()
        },
        // Refetch on every mount: the Previous Rounds panel relies on this
        // value being current the moment it opens, even after a round just
        // completed off-screen. The default 1h staleTime would otherwise
        // serve a cached pre-completion index until the next event tick.
        staleTime: 0,
    })

    return data
}
