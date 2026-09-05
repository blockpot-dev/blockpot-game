import { useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { resolveOperatorWinners } from '@/utilities/draw/resolve-operator-winners'
import { DrawnNumber } from '@/types/draw'
import { GameType } from '@/providers/SelectedGameProvider'
import useDrawRead from '../read/useDrawRead'
import useOperatorRead from '../read/useOperatorRead'

// Prizes paid for one completed round, with the real recipient resolved behind
// the operator contract.
//
// Deliberately NOT useRoundDraw: that hook calls useDrawRead() with no game
// override, so it is bound to the global SelectedGameProvider. /transparency
// keeps a page-local game (seeded from ?game=, never written back — B-AUD-3
// requires that verifying a Quick Game round does not change what the player is
// entering on /play), so reusing it would read the wrong draw contract whenever
// the two differ, silently and with everything still green. This takes the game
// as an argument for the same reason useDrawProof does.
export default function useRoundPrizesPaid(selectedGame: GameType, roundIndex: number) {
    const chainId = useChainId()
    const { game, gameContractName } = useDrawRead(selectedGame)
    const lgo = useOperatorRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['roundPrizesPaid', selectedGame, chainId, roundIndex],
        enabled: roundIndex >= 0,
        queryFn: async (): Promise<readonly DrawnNumber[]> => {
            const roundData = await game.getRoundData([roundIndex])
            return resolveOperatorWinners(
                roundData.draws,
                roundIndex,
                getContractAddress(chainId, gameContractName),
                getContractAddress(chainId, ContractName.OPERATOR),
                game,
                lgo,
            )
        },
    })

    return { draws: data, isLoading }
}
