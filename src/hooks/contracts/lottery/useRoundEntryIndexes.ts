import { ZERO_ADDRESS } from '@/web3/constants'
import { useAccount, useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { resolvePlayerEntries } from '@/utilities/lottery/resolve-player-entries'
import useLotteryRead from '../read/useLotteryRead'
import useLGORead from '../read/useLGORead'

export default function useRoundEntryIndexes(roundIndex: number) {
    const chainId = useChainId()
    const { game, selectedGame, gameContractName } = useLotteryRead()
    const lgo = useLGORead().read
    const { address } = useAccount()

    const { data } = useQuery({
        queryKey: ['currentRoundEntryIndexes', selectedGame, address ?? ZERO_ADDRESS, roundIndex.toString()],
        queryFn: async () => {
            const lotteryAddress = getContractAddress(chainId, gameContractName)
            const lgoAddress = getContractAddress(chainId, ContractName.LGO)
            const entries = await resolvePlayerEntries(
                Number(roundIndex),
                address,
                lotteryAddress,
                lgoAddress,
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
