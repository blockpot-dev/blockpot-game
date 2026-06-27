import { Address, formatEther, parseEther } from 'viem'
import { useAccount, useChainId } from 'wagmi'
import { ZERO_ADDRESS } from '@/web3/constants'
import { LotteryRound, LotteryRoundDefault } from '@/types/lottery'
import { useQuery } from '@tanstack/react-query'
import useLotteryRead from '../read/useLotteryRead'
import useAvailablePublicClient from '@/hooks/web3/useAvailablePublicClient'
import useFiatConverter from '@/hooks/utilities/useFiatConverter'
import { Amounts, DEFAULT_AMOUNTS } from '@/types/lottery/tokens'
import { DEFAULT_GAME_CONFIG, GameConfig } from '@/types/lottery/config'
import useNativeCurrency from '@/hooks/web3/useNativeCurrency'
import { calculateMaxRoundsInPot } from './useMaxRoundsInPot'

export const DEFAULT_LOTTERY: LotteryState = {
    roundIndex: -1,
    pots: [0n],
    amountPerEntry: parseEther('1'),
    isDrawingNumbers: false,
    lotteryHash: '0',
    randomNumberProviderAddress: ZERO_ADDRESS,
    currentChanceOfWinner: 1n,
    currentRound: LotteryRoundDefault,
    timeBetweenRounds: 1,
    jackpot: DEFAULT_AMOUNTS,
    gameConfig: DEFAULT_GAME_CONFIG
}

export type LotteryState = {
    lotteryHash: string,
    roundIndex: number,
    pots: readonly bigint[],
    amountPerEntry: bigint,
    isDrawingNumbers: boolean,
    randomNumberProviderAddress: Address
    currentChanceOfWinner: bigint
    currentRound: LotteryRound
    gameConfig: GameConfig
    timeBetweenRounds: number
    jackpot: Amounts
}

export default function useLotteryState() {
    const chainId = useChainId()
    const { address } = useAccount()
    const { game, selectedGame } = useLotteryRead()
    const nativeToken = useNativeCurrency()
    const publicClient = useAvailablePublicClient()
    const converter = useFiatConverter()

    const { data } = useQuery({
        queryKey: ['lotteryState', selectedGame, chainId, address ?? ZERO_ADDRESS],
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

            const jackpotAmount = pots[0]
            const jackpotFiat = converter(jackpotAmount)
            const jackpot = {
                amount: jackpotAmount,
                amountFormatted: formatEther(jackpotAmount),
                fiat: jackpotFiat.value,
                fiatFormatted: jackpotFiat.formattedValue,
                nativeToken
            }
            const currentRound: LotteryRound = {
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
                lotteryHash: blockNumber.toString(),
                roundIndex: roundIndex,
                pots,
                amountPerEntry,
                isDrawingNumbers,
                randomNumberProviderAddress,
                currentChanceOfWinner,
                currentRound,
                timeBetweenRounds,
                jackpot,
                gameConfig
            }
        }
    })

    return data
}
