import { DrawEntry } from '@/types/draw'
import useDrawRead from '../read/useDrawRead'
import { useQuery } from '@tanstack/react-query'

export default function useDrawEntry(options: { roundIndex: number, entryIndex: number}) {
    const { roundIndex, entryIndex } = options
    const { game, selectedGame } = useDrawRead()

    const { data } = useQuery<DrawEntry>({
        queryKey: ['drawEntry', selectedGame, roundIndex.toString(), entryIndex.toString()],
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