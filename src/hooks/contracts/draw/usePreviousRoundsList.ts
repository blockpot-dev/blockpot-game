import { useQueries } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useChainId } from 'wagmi'
import { GameType } from '@/providers/SelectedGameProvider'
import { DrawRound } from '@/types/draw'
import useGameLatestRoundIndex from './useGameLatestRoundIndex'

export const BATCH_SIZE = 10

export type PreviousRoundsFilter = 'all' | 'main' | 'quick'

export type PreviousRoundItem = {
    key: string
    gameType: GameType
    roundIndex: number
    drawTime?: number
}

type LoadedCount = Record<GameType, number>

const INITIAL_LOADED_COUNT: LoadedCount = { main: BATCH_SIZE, quick: BATCH_SIZE }

const gamesForFilter = (filter: PreviousRoundsFilter): GameType[] =>
    filter === 'all' ? ['main', 'quick'] : [filter]

export default function usePreviousRoundsList({ filter }: { filter: PreviousRoundsFilter }) {
    const chainId = useChainId()
    const latestMain = useGameLatestRoundIndex('main')
    const latestQuick = useGameLatestRoundIndex('quick')

    const [loadedCount, setLoadedCount] = useState<LoadedCount>(INITIAL_LOADED_COUNT)

    const prevFilterRef = useRef(filter)
    useEffect(() => {
        if (prevFilterRef.current !== filter) {
            prevFilterRef.current = filter
            setLoadedCount(INITIAL_LOADED_COUNT)
        }
    }, [filter])

    const candidateIndexes = useMemo(() => {
        const result: { gameType: GameType; roundIndex: number }[] = []
        const latests: Record<GameType, number | undefined> = { main: latestMain, quick: latestQuick }
        for (const gameType of gamesForFilter(filter)) {
            const latest = latests[gameType]
            if (latest === undefined) continue
            const count = Math.min(loadedCount[gameType], latest)
            for (let i = 0; i < count; i++) {
                result.push({ gameType, roundIndex: latest - 1 - i })
            }
        }
        return result
    }, [filter, loadedCount, latestMain, latestQuick])

    const cachedRounds = useQueries({
        queries: candidateIndexes.map(({ gameType, roundIndex }) => ({
            queryKey: ['specificRound', gameType, chainId, roundIndex.toString()],
            enabled: false,
        })),
    })

    const items = useMemo<PreviousRoundItem[]>(() => {
        const result = candidateIndexes.map(({ gameType, roundIndex }, idx) => {
            const data = cachedRounds[idx]?.data as DrawRound | undefined
            return {
                key: `${gameType}:${roundIndex}`,
                gameType,
                roundIndex,
                drawTime: data?.drawTime !== undefined ? Number(data.drawTime) : undefined,
            }
        })
        result.sort((a, b) => {
            const aT = a.drawTime ?? Number.MAX_SAFE_INTEGER
            const bT = b.drawTime ?? Number.MAX_SAFE_INTEGER
            return bT - aT
        })
        return result
    }, [candidateIndexes, cachedRounds])

    const hasMore = useMemo(() => {
        const latests: Record<GameType, number | undefined> = { main: latestMain, quick: latestQuick }
        return gamesForFilter(filter).some(g => {
            const latest = latests[g]
            return latest !== undefined && loadedCount[g] < latest
        })
    }, [filter, loadedCount, latestMain, latestQuick])

    const loadMore = () => {
        setLoadedCount(prev => {
            const next = { ...prev }
            for (const g of gamesForFilter(filter)) {
                next[g] = prev[g] + BATCH_SIZE
            }
            return next
        })
    }

    const inScope = gamesForFilter(filter)
    const isInitialLoading =
        (inScope.includes('main') && latestMain === undefined) ||
        (inScope.includes('quick') && latestQuick === undefined)

    return { items, loadMore, hasMore, isInitialLoading }
}
