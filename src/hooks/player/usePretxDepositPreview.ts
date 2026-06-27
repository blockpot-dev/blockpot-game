import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { evaluatePretxDeposit, PretxDecision } from './usePretxDeposit'

// Reactive wrapper over evaluatePretxDeposit so the UI can decide in advance
// whether the off-chain gate will reject the entry — lets the purchase button
// be disabled with a reason instead of letting the user eat an on-chain revert.
//
// Returns `null` whenever the gate can't run (no service URL, no session,
// backend 404, network blip) — callers should treat null as "no verdict" and
// fall back to their existing checks rather than blocking entries.
export default function usePretxDepositPreview(totalWei: bigint) {
    const chainId = useChainId()
    const account = useAccountAddress() as Address

    const enabled = account !== ZERO_ADDRESS && totalWei > 0n
    const { data, isLoading, isPlaceholderData } = useQuery<PretxDecision | null>({
        queryKey: ['pretxDeposit:preview', chainId, account, totalWei.toString()],
        queryFn: () => evaluatePretxDeposit({
            chainId,
            walletAddress: account,
            amountWei: totalWei,
        }),
        enabled,
        staleTime: 10_000,
        placeholderData: keepPreviousData,
    })

    return { decision: data ?? null, isLoading: enabled && isLoading, isPlaceholderData }
}
