import { useAccount, useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { resolvePlayerEntries } from '@/utilities/draw/resolve-player-entries'
import { useDraw } from '@/providers/BlockpotProvider'
import { GameType } from '@/providers/SelectedGameProvider'
import useDrawRead from '../read/useDrawRead'
import useOperatorRead from '../read/useOperatorRead'

export default function usePlayerEntries(roundIndex: number, gameType?: GameType) {
    const chainId = useChainId()
    const { drawHash } = useDraw()
    const { address } = useAccount()
    const { game, selectedGame, gameContractName } = useDrawRead(gameType)
    const lgo = useOperatorRead().read

    const { data } = useQuery({
        queryKey: ['playerEntries', selectedGame, chainId, address, drawHash, roundIndex],
        queryFn: async () => {
            if (roundIndex < 0) {
                return { entries: [] }
            }
            const drawAddress = getContractAddress(chainId, gameContractName)
            const operatorAddress = getContractAddress(chainId, ContractName.OPERATOR)
            const entries = await resolvePlayerEntries(
                roundIndex,
                address,
                drawAddress,
                operatorAddress,
                game,
                lgo,
            )
            return { entries }
        },
        enabled: !!address
    })

    if (!data) {
        return undefined
    }

    return data
}
