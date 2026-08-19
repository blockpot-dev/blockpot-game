import { ZERO_ADDRESS } from '@/web3/constants'
import { useAccount, useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { resolvePlayerEntries } from '@/utilities/draw/resolve-player-entries'
import useDrawRead from '../read/useDrawRead'
import useOperatorRead from '../read/useOperatorRead'

export default function useRoundEntryIndexes(roundIndex: number) {
    const chainId = useChainId()
    const { game, selectedGame, gameContractName } = useDrawRead()
    const lgo = useOperatorRead().read
    const { address } = useAccount()

    const { data } = useQuery({
        queryKey: ['currentRoundEntryIndexes', selectedGame, address ?? ZERO_ADDRESS, roundIndex.toString()],
        queryFn: async () => {
            const drawAddress = getContractAddress(chainId, gameContractName)
            const operatorAddress = getContractAddress(chainId, ContractName.OPERATOR)
            const entries = await resolvePlayerEntries(
                Number(roundIndex),
                address,
                drawAddress,
                operatorAddress,
                game,
                lgo,
            )
            return {
                roundIndex,
                entryIndexes: entries.map((entry) => Number(entry.index))
            }
        },
        enabled: !!address && roundIndex !== -1
    })

    if (data?.roundIndex !== roundIndex) {
        return []
    }
    return data?.entryIndexes ?? []
}
