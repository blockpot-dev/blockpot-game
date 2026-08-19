import { GameConfig } from '@/types/draw/config'
import { useMemo } from 'react'

export function calculateMaxRoundsInPot(gameConfig: GameConfig) {
    if (gameConfig.chanceInitial === 0) {
        return null
    }

    let chance = BigInt(gameConfig.chanceInitial)
    let maxRoundsInPot = 1
    while (chance < BigInt(gameConfig.chanceMax) && maxRoundsInPot <= 9999) {
        chance = (chance * BigInt(gameConfig.chanceMultiplier)) / 100n
        chance += BigInt(gameConfig.chanceIncrement)
        maxRoundsInPot++
    }
    return maxRoundsInPot
}

export default function useMaxRoundsInPot(gameConfig: GameConfig) {
    return useMemo(() => {
        return calculateMaxRoundsInPot(gameConfig)
    }, [gameConfig])
}
