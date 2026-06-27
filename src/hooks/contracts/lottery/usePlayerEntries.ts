import { useAccount, useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { resolvePlayerEntries } from '@/utilities/lottery/resolve-player-entries'
import { useLottery } from '@/providers/BlockpotProvider'
import { GameType } from '@/providers/SelectedGameProvider'
import useLotteryRead from '../read/useLotteryRead'
import useLGORead from '../read/useLGORead'

export default function usePlayerEntries(roundIndex: number, gameType?: GameType) {
    const chainId = useChainId()
    const { lotteryHash } = useLottery()
    const { address } = useAccount()
    const { game, selectedGame, gameContractName } = useLotteryRead(gameType)
    const lgo = useLGORead().read

    const { data } = useQuery({
        queryKey: ['playerEntries', selectedGame, chainId, address, lotteryHash, roundIndex],
        queryFn: async () => {
            if (roundIndex < 0) {
                return { entries: [] }
            }
            const lotteryAddress = getContractAddress(chainId, gameContractName)
            const lgoAddress = getContractAddress(chainId, ContractName.LGO)
            const entries = await resolvePlayerEntries(
                roundIndex,
                address,
                lotteryAddress,
                lgoAddress,
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
