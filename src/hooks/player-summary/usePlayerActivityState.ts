import { useMemo } from 'react'
import { Address } from 'viem'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useKycTier from '@/hooks/contracts/kyc-registry/useKycTier'
import usePlayerGates from '@/hooks/contracts/kyc-registry/usePlayerGates'
import useLifetimeSnapshot from '@/hooks/contracts/operator/useLifetimeSnapshot'
import useActivePolicy from '@/hooks/contracts/kyc/useActivePolicy'
import { ZERO_ADDRESS } from '@/web3/constants'

export type PlayerTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4'

// One direction of the player's cumulative flow position. Gates are shared
// per tier; only the amounts split by direction — `inflow` reports gross
// cumulative entries against `TierPolicy.inflowCapEurMinor` (the on-chain
// entry gate), `outflow` reports gross cumulative claims against
// `outflowCapEurMinor` (the on-chain withdraw / direct-pay gate).
//
// The gate model itself is netted: a single signed net position
// (cumEntered − cumClaims) consumes the inflow cap while positive and the
// outflow cap while negative, so only one cap is being eaten into at any
// moment. These fields stay gross totals for the existing consumers: the
// entry and claim guards.
//
// The standing tier UI that used to read them is gone (BLO-675): TierBadge,
// TierBreakdown, NetFlowCard, TierUpgradePrompt and PrizePoolPreCommitBanner
// are all deleted. Nothing player-facing renders a ratio or a headroom figure
// any more, and nothing should start — the four verification surfaces are the
// only place verification reaches a player.
export type DirectionalFlow = {
    capEurMinor: number | null // null = unlimited (uint256.max)
    usedEurMinor: number
    headroomEurMinor: number // 0 at cap; Number.MAX_SAFE_INTEGER when unlimited
    ratio: number // used / cap clamped [0,1]; 0 when unlimited
}

// Fully-derived player activity state, composed client-side from chain reads
// (KYCRegistry.tierOf + activePolicy + getPlayerGates, the operator lifetime counters).
//
// After task 94 tier identity is a gates-only walk on-chain — caps no longer
// move the tier, they bound actions at call time against the netted flow
// position. Both flows read the caps of the player's current
// (gate-qualified) tier:
//
//   - `inflow.usedEurMinor`  = the operator `lifetimeEnteredEurMinor` - every euro
//                              entering the system.
//   - `outflow.usedEurMinor` = the operator `lifetimeClaimedEurMinor` - every euro
//                              leaving (withdrawals, full direct-pays, the
//                              paid slice of partial direct-pays).
//   - `nextTier`             = the tier one above the chain tier, with the
//                              gate bits still missing
//                              (`requiredGates[next] & ~playerGates`) and its
//                              caps — the verification-progress surface.
//   - `pendingClaimEurMinor` = escrowed winnings beyond what the current
//                              outflow headroom lets the player claim.
//                              Escrow in EUR-minor is `cumWon − cumClaims`:
//                              every win bumps `lifetimeWonEurMinor` and every
//                              exit bumps `lifetimeClaimedEurMinor`, so the
//                              difference is exactly what still sits inside.
//   - `largestSingleWinEurMinor` is telemetry only — no gate reads it.
//
// Returns `state: undefined` while disconnected, before the snapshot
// resolves, or when no policy is seeded (the chain is deny-by-default
// without a policy, so there is nothing meaningful to meter).
export type PlayerActivityState = {
    currentTier: PlayerTier
    cumEnteredEurMinor: number
    cumWonEurMinor: number
    cumClaimsEurMinor: number
    largestSingleWinEurMinor: number
    inflow: DirectionalFlow
    outflow: DirectionalFlow
    nextTier: {
        tier: PlayerTier
        missingGates: bigint
        inflowCapEurMinor: number | null
        outflowCapEurMinor: number | null
    } | null
    pendingClaimEurMinor: number
}

const TIER_BY_ORDINAL: PlayerTier[] = ['T0', 'T1', 'T2', 'T3', 'T4']

function tierFromOrdinal(ordinal: number): PlayerTier {
    if (ordinal < 0 || ordinal >= TIER_BY_ORDINAL.length) return 'T0'
    return TIER_BY_ORDINAL[ordinal]
}

function eurMinorBigintToNumber(value: bigint): number {
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) return Number.MAX_SAFE_INTEGER
    return Number(value)
}

// The contract requires the top tier to carry both caps at type(uint256).max.
// Treat anything above MAX_SAFE_INTEGER as unlimited — comparisons in
// `number` space below would otherwise round.
function isUnlimitedCap(value: bigint): boolean {
    return value > BigInt(Number.MAX_SAFE_INTEGER)
}

function deriveFlow(capRaw: bigint, usedEurMinor: number): DirectionalFlow {
    if (isUnlimitedCap(capRaw)) {
        return {
            capEurMinor: null,
            usedEurMinor,
            headroomEurMinor: Number.MAX_SAFE_INTEGER,
            ratio: 0,
        }
    }
    const capEurMinor = eurMinorBigintToNumber(capRaw)
    const headroomEurMinor = Math.max(0, capEurMinor - usedEurMinor)
    const ratio = capEurMinor === 0
        ? 1
        : Math.min(Math.max(usedEurMinor / capEurMinor, 0), 1)
    return { capEurMinor, usedEurMinor, headroomEurMinor, ratio }
}

export default function usePlayerActivityState() {
    const address = useAccountAddress()
    const enabled = address !== ZERO_ADDRESS

    const { tier: chainTierOrdinal, isLoading: tierLoading } = useKycTier(address as Address)
    const { gates, isLoading: gatesLoading } = usePlayerGates(address as Address)
    const { snapshot, isLoading: snapshotLoading } = useLifetimeSnapshot(address as Address)
    const { policy, isLoading: policyLoading } = useActivePolicy()

    const isLoading = enabled && (tierLoading || gatesLoading || snapshotLoading || policyLoading)

    const state = useMemo<PlayerActivityState | undefined>(() => {
        if (!enabled || !snapshot) return undefined

        const tiers = policy?.tiers ?? []
        const currentTierPolicy = tiers[chainTierOrdinal]
        if (!currentTierPolicy) return undefined

        const currentTier = tierFromOrdinal(chainTierOrdinal)
        const cumEnteredEurMinor = eurMinorBigintToNumber(snapshot.enteredEurMinor)
        const cumWonEurMinor = eurMinorBigintToNumber(snapshot.wonEurMinor)
        const largestSingleWinEurMinor = eurMinorBigintToNumber(snapshot.largestSingleWinEurMinor)
        const cumClaimsEurMinor = eurMinorBigintToNumber(snapshot.claimedEurMinor)

        const inflow = deriveFlow(currentTierPolicy.inflowCapEurMinor, cumEnteredEurMinor)
        const outflow = deriveFlow(currentTierPolicy.outflowCapEurMinor, cumClaimsEurMinor)

        const nextOrdinal = chainTierOrdinal + 1
        const nextTierPolicy = tiers[nextOrdinal]
        const nextTier = nextTierPolicy && nextOrdinal < TIER_BY_ORDINAL.length
            ? {
                tier: TIER_BY_ORDINAL[nextOrdinal],
                missingGates: nextTierPolicy.requiredGates & ~gates,
                inflowCapEurMinor: isUnlimitedCap(nextTierPolicy.inflowCapEurMinor)
                    ? null
                    : eurMinorBigintToNumber(nextTierPolicy.inflowCapEurMinor),
                outflowCapEurMinor: isUnlimitedCap(nextTierPolicy.outflowCapEurMinor)
                    ? null
                    : eurMinorBigintToNumber(nextTierPolicy.outflowCapEurMinor),
            }
            : null

        const escrowedEurMinor = Math.max(0, cumWonEurMinor - cumClaimsEurMinor)
        const pendingClaimEurMinor = Math.max(0, escrowedEurMinor - outflow.headroomEurMinor)

        return {
            currentTier,
            cumEnteredEurMinor,
            cumWonEurMinor,
            cumClaimsEurMinor,
            largestSingleWinEurMinor,
            inflow,
            outflow,
            nextTier,
            pendingClaimEurMinor,
        }
    }, [enabled, snapshot, chainTierOrdinal, gates, policy])

    return { state, isLoading }
}
