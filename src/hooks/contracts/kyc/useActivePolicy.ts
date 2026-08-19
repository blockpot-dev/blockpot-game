import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import useKycRegistryRead from '../read/useKycRegistryRead'

export type TierPolicy = {
    requiredGates: bigint
    inflowCapEurMinor: bigint
    outflowCapEurMinor: bigint
}

export type ActivePolicy = {
    tiers: TierPolicy[]
    description: string
}

// Reads the currently-active KYCPolicy from the registry. `tiers[0]` is the
// T0 catch-all (zero requiredGates, empty bitmap). Gates are shared per tier;
// only the cap amounts split by direction: `inflowCapEurMinor` bounds gross
// cumulative entries (gated on-chain in LGO.enter/enterWeth) and
// `outflowCapEurMinor` bounds gross cumulative claims (withdrawals + the paid
// slice of direct-pays). Both caps are strictly increasing per field across
// tiers; the top tier carries `type(uint256).max` on both, meaning unlimited.
// All amounts are EUR-minor. Caps bound actions per direction at call time —
// tier identity itself is a gates-only walk (`tierOf`).
//
// Invalidated by BlockpotEventsProvider on PolicyAdded.
export default function useActivePolicy() {
    const chainId = useChainId()
    const registry = useKycRegistryRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['kyc:activePolicy', chainId],
        queryFn: async (): Promise<ActivePolicy> => {
            const raw = await registry.activePolicy() as {
                tiers: readonly {
                    requiredGates: bigint,
                    inflowCapEurMinor: bigint,
                    outflowCapEurMinor: bigint,
                }[],
                description: string,
            }
            return {
                tiers: raw.tiers.map((t) => ({
                    requiredGates: BigInt(t.requiredGates),
                    inflowCapEurMinor: BigInt(t.inflowCapEurMinor),
                    outflowCapEurMinor: BigInt(t.outflowCapEurMinor),
                })),
                description: raw.description,
            }
        },
    })

    return {
        policy: data,
        isLoading,
    }
}
