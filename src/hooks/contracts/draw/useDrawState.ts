import { Address, formatEther, parseEther } from 'viem'
import { useAccount, useChainId } from 'wagmi'
import { ZERO_ADDRESS } from '@/web3/constants'
import { DrawRound, DrawRoundDefault } from '@/types/draw'
import { useQuery } from '@tanstack/react-query'
import useDrawRead from '../read/useDrawRead'
import useAvailablePublicClient from '@/hooks/web3/useAvailablePublicClient'
import useFiatConverter from '@/hooks/utilities/useFiatConverter'
import { Amounts, DEFAULT_AMOUNTS } from '@/types/draw/tokens'
import { DEFAULT_GAME_CONFIG, GameConfig } from '@/types/draw/config'
import useNativeCurrency from '@/hooks/web3/useNativeCurrency'
import { calculateMaxRoundsInPot } from './useMaxRoundsInPot'

export const DEFAULT_DRAW: DrawState = {
    roundIndex: -1,
    pots: [0n],
    amountPerEntry: parseEther('1'),
    isDrawingNumbers: false,
    drawHash: '0',
    randomNumberProviderAddress: ZERO_ADDRESS,
    currentChanceOfWinner: 1n,
    currentRound: DrawRoundDefault,
    timeBetweenRounds: 1,
    prizePool: DEFAULT_AMOUNTS,
    gameConfig: DEFAULT_GAME_CONFIG
}

export type DrawState = {
    drawHash: string,
    roundIndex: number,
    pots: readonly bigint[],
    amountPerEntry: bigint,
    isDrawingNumbers: boolean,
    randomNumberProviderAddress: Address
    currentChanceOfWinner: bigint
    currentRound: DrawRound
    gameConfig: GameConfig
    timeBetweenRounds: number
    prizePool: Amounts
}

export default function useDrawState() {
    const chainId = useChainId()
    const { address } = useAccount()
    const { game, selectedGame } = useDrawRead()
    const nativeToken = useNativeCurrency()
    const publicClient = useAvailablePublicClient()
    const converter = useFiatConverter()

    const { data } = useQuery({
        queryKey: ['drawState', selectedGame, chainId, address ?? ZERO_ADDRESS],
        queryFn: async () => {
            const pots = await game.currentPots()
            const amountPerEntry = await game.entryAmount()
            const isDrawingNumbers = await game.isDrawingNumbers()
            const roundIndex = await game.currentRoundIndex()
            const randomNumberProviderAddress = await game.randomNumberProvider()
            const currentChanceOfWinner = BigInt(await game.chanceOfWinner())
            const blockNumber = await publicClient.getBlockNumber()
            const timeBetweenRounds = await game.getTimeBetweenRounds()
            const gameConfig = await game.currentGameConfig()
            const maxRoundsInPot = calculateMaxRoundsInPot(gameConfig) ?? 0

            const roundData = await game.getRoundData([roundIndex])

            const prizePoolAmount = pots[0]
            const prizePoolFiat = converter(prizePoolAmount)
            const prizePool = {
                amount: prizePoolAmount,
                amountFormatted: formatEther(prizePoolAmount),
                fiat: prizePoolFiat.value,
                fiatFormatted: prizePoolFiat.formattedValue,
                nativeToken
            }
            const currentRound: DrawRound = {
                roundIndex: roundIndex,
                draws: roundData.draws,
                entryCount: roundData.entryCount,
                prizePool: roundData.prizePool,
                potIndex: roundData.potIndex,
                roundIndexInPot: roundData.roundIndexInPot,
                drawTime: roundData.drawTime,
                chance: roundData.chance,
                done: roundData.status === 2, // 2 = DONE
                maxRoundsInPot
            }

            return {
                drawHash: blockNumber.toString(),
                roundIndex: roundIndex,
                pots,
                amountPerEntry,
                isDrawingNumbers,
                randomNumberProviderAddress,
                currentChanceOfWinner,
                currentRound,
                timeBetweenRounds,
                prizePool,
                gameConfig
            }
        }
    })

    return data
}
