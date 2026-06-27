import { Address } from 'viem'
import type { ExtractAbiFunction, AbiParametersToPrimitiveTypes } from 'abitype'
import { lotteryAbi } from '@/abi/lotteryAbi'

type GetEntryFn = ExtractAbiFunction<typeof lotteryAbi, 'getEntry'>

export type LotteryRoundId = {
  potIndex: number
  roundIndex: number
  maxRoundsPerPot: number
}

export type LotteryEntry = AbiParametersToPrimitiveTypes<GetEntryFn['outputs']>[0] & {
  index: number;
};

export type DrawnNumber = {
  winner: Address
  number: number
  prize: bigint
}

export type LotteryRound = {
  roundIndex: number,
  draws: readonly DrawnNumber[];
  prizePool: bigint;
  drawTime: number;
  entryCount: number;
  potIndex: number;
  roundIndexInPot: number;
  chance: number;
  done: boolean;
  maxRoundsInPot: number
}

export type LotteryConfig = {
  entryFee: bigint
  timeBetweenRounds: bigint
  chanceIncrementAmount: bigint
  chanceMultiplierAmount: bigint
  chanceInitialAmount: bigint
  rewardsPercentage: bigint
  nextPotPercentage: bigint
  potAllocations: bigint[]
}

export const LotteryRoundDefault: LotteryRound = {
    roundIndex: -1,
    draws: [] as readonly DrawnNumber[],
    prizePool: 0n,
    entryCount: 0,
    potIndex: 0,
    roundIndexInPot: 0,
    drawTime: 0,
    chance: 10000,
    done: false,
    maxRoundsInPot: 0
}