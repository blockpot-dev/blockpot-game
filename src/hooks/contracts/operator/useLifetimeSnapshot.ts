import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import useOperatorRead from '../read/useOperatorRead'

export type LifetimeSnapshot = {
    enteredEurMinor: bigint
    wonEurMinor: bigint
    largestSingleWinEurMinor: bigint
    claimedEurMinor: bigint
}

// Single chain-snapshot of the EUR-minor lifetime counters plus the running
// max single-win figure. The central event provider invalidates the
// `lgo:lifetime` query-key prefix on OperatorEntry / PlayerCredited /
// PlayerPaidDirect plus the LifetimeEnteredUpdated / LifetimeWonUpdated /
// LargestSingleWinUpdated / LifetimeClaimedUpdated bumps emitted from the
// EUR backfill path.
export default function useLifetimeSnapshot(address: Address) {
    const chainId = useChainId()
    const lgo = useOperatorRead().read

    const { data, isLoading, error } = useQuery({
        queryKey: ['operator:lifetime', 'snapshot', chainId, address],
        queryFn: async (): Promise<LifetimeSnapshot> => {
            const [enteredEurMinor, wonEurMinor, largestSingleWinEurMinor, claimedEurMinor] = await Promise.all([
                lgo.lifetimeEnteredEurMinor([address]),
                lgo.lifetimeWonEurMinor([address]),
                lgo.largestSingleWinEurMinor([address]),
                lgo.lifetimeClaimedEurMinor([address]),
            ])
            return {
                enteredEurMinor: BigInt(enteredEurMinor),
                wonEurMinor: BigInt(wonEurMinor),
                largestSingleWinEurMinor: BigInt(largestSingleWinEurMinor),
                claimedEurMinor: BigInt(claimedEurMinor),
            }
        },
        enabled: address !== ZERO_ADDRESS,
    })

    return {
        snapshot: data,
        isLoading,
        error,
    }
}
