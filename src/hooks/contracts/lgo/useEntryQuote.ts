import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { getContractAddress } from '@/constants/contract-addresses'
import { ZERO_ADDRESS } from '@/web3/constants'
import { useSelectedGame } from '@/providers/SelectedGameProvider'
import useLGORead from '../read/useLGORead'

export type EntryQuote = {
    total: bigint
    pea: bigint
    cf: bigint
    opFee: bigint
}

export default function useEntryQuote(amount: bigint) {
    const chainId = useChainId()
    const { gameContractName } = useSelectedGame()
    const lotteryAddress = getContractAddress(chainId, gameContractName)
    const lgo = useLGORead().read

    // LGO.entryQuote takes uint16 — clamp to its valid range.
    const clamped = amount < 0n ? 0 : amount > 0xffffn ? 0xffff : Number(amount)

    const { data, isLoading, isPlaceholderData } = useQuery({
        queryKey: ['lgo:entryQuote', chainId, lotteryAddress, clamped],
        queryFn: async () => {
            const [total, pea, cf, opFee] = await lgo.entryQuote([lotteryAddress, clamped])
            return { total, pea, cf, opFee }
        },
        enabled: clamped > 0 && lotteryAddress !== ZERO_ADDRESS,
        placeholderData: keepPreviousData,
    })

    const zero: EntryQuote = { total: 0n, pea: 0n, cf: 0n, opFee: 0n }
    return {
        quote: data ?? zero,
        isLoading,
        isPlaceholderData,
    }
}
