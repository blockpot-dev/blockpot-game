export type GameConfig = {
    timeBetweenRounds: number;
    chanceInitial: number;
    chanceMultiplier: number;
    chanceIncrement: number;
    chanceMax: number;
    nextPotAllocation: number;
    parentGamePotAllocation: number;
    prizeTierAllocations: readonly number[];
    ignoreOdds: boolean;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
    timeBetweenRounds: 0,
    chanceInitial: 0,
    chanceMultiplier: 0,
    chanceIncrement: 0,
    chanceMax: 0,
    nextPotAllocation: 0,
    parentGamePotAllocation: 0,
    prizeTierAllocations: [],
    ignoreOdds: false,
} as const
