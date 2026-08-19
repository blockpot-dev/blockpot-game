import { useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { DrawRound } from '@/types/draw'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { resolveOperatorWinners } from '@/utilities/draw/resolve-operator-winners'
import { GameType } from '@/providers/SelectedGameProvider'
import useDrawRead from '../read/useDrawRead'
import useOperatorRead from '../read/useOperatorRead'
import { calculateMaxRoundsInPot } from './useMaxRoundsInPot'

export default function useDrawRound(roundIndex: number, gameType?: GameType) {
    const chainId = useChainId()
    const { game, selectedGame, gameContractName } = useDrawRead(gameType)
    const lgo = useOperatorRead().read

    const { data } = useQuery<DrawRound>({
        queryKey: ['specificRound', selectedGame, chainId, roundIndex.toString()],
        queryFn: async () => {
            const roundData = await game.getRoundData([roundIndex])
            const maxRoundsInPot = calculateMaxRoundsInPot(await game.currentGameConfig()) ?? 0

            const drawAddress = getContractAddress(chainId, gameContractName)
            const operatorAddress = getContractAddress(chainId, ContractName.OPERATOR)
            const draws = await resolveOperatorWinners(
                roundData.draws,
                roundIndex,
                drawAddress,
                operatorAddress,
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
