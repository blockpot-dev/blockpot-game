import { LotteryEntry } from '@/types/lottery'
import useLotteryRead from '../read/useLotteryRead'
import { useQuery } from '@tanstack/react-query'

export default function useLotteryEntry(options: { roundIndex: number, entryIndex: number}) {
    const { roundIndex, entryIndex } = options
    const { game, selectedGame } = useLotteryRead()

    const { data } = useQuery<LotteryEntry>({
        queryKey: ['lotteryEntry', selectedGame, roundIndex.toString(), entryIndex.toString()],
        queryFn: async () => {
            const entry = await game.getEntry([entryIndex, roundIndex])
            return {
                ...entry,
                index: entryIndex
            }
        }
    })

    return data
}