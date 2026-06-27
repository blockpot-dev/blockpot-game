import { useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { LotteryRound } from '@/types/lottery'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { resolveLgoWinners } from '@/utilities/lottery/resolve-lgo-winners'
import { GameType } from '@/providers/SelectedGameProvider'
import useLotteryRead from '../read/useLotteryRead'
import useLGORead from '../read/useLGORead'
import { calculateMaxRoundsInPot } from './useMaxRoundsInPot'

export default function useLotteryRound(roundIndex: number, gameType?: GameType) {
    const chainId = useChainId()
    const { game, selectedGame, gameContractName } = useLotteryRead(gameType)
    const lgo = useLGORead().read

    const { data } = useQuery<LotteryRound>({
        queryKey: ['specificRound', selectedGame, chainId, roundIndex.toString()],
        queryFn: async () => {
            const roundData = await game.getRoundData([roundIndex])
            const maxRoundsInPot = calculateMaxRoundsInPot(await game.currentGameConfig()) ?? 0

            const lotteryAddress = getContractAddress(chainId, gameContractName)
            const lgoAddress = getContractAddress(chainId, ContractName.LGO)
            const draws = await resolveLgoWinners(
                roundData.draws,
                roundIndex,
                lotteryAddress,
                lgoAddress,
                game,
                lgo,
            )

            return {
                roundIndex,
                draws,
                prizePool: roundData.prizePool,
                entryCount: roundData.entryCount,
                drawTime: roundData.drawTime,
                chance: roundData.chance,
                done: roundData.status === 2, // 2 = DONE // TODO: Perhaps we need to handle all enum states??
                potIndex: roundData.potIndex,
                roundIndexInPot: roundData.roundIndexInPot,
                maxRoundsInPot: maxRoundsInPot
            }
        },
        enabled: roundIndex >= 0n
    })

    return data
}
