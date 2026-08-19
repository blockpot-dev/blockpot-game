import { Meta, StoryObj } from '@storybook/react'
import AccountDialogView, { AccountDialogViewProps } from './AccountDialogView'
import type { PlayerActivityState, PlayerTier } from '@/hooks/player-summary/usePlayerActivityState'
import type { TierPolicy } from '@/hooks/contracts/kyc/useActivePolicy'
import type { GateRecord, GateType } from '@/hooks/player/usePlayerKyc'
import type { ClaimDecision } from '@/hooks/claim/types'
import { GATE_BIT_POSITION } from '@/lib/kyc/gateBitmask'

const meta: Meta<typeof AccountDialogView> = {
    component: AccountDialogView,
    decorators: [
        (Story) => (
            <div style={{ minWidth: 560 }}>
                <Story />
            </div>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof AccountDialogView>

const UINT256_MAX = (1n << 256n) - 1n

// Mirrors the seeded gaming-service KYCPolicy after task 94: gates are shared
// per tier; only the cap amounts split by direction. Each tier carries a gross
// cumulative inflow cap (entries) and outflow cap (claims); the top tier sits
// at the unlimited sentinel on both fields.
const FOUR_TIER_POLICY: TierPolicy[] = [
    { requiredGates: 0n, inflowCapEurMinor: 900_00n, outflowCapEurMinor: 500_00n },
    { requiredGates: 1n << 1n, inflowCapEurMinor: 2_000_00n, outflowCapEurMinor: 2_000_00n },
    { requiredGates: (1n << 1n) | (1n << 2n), inflowCapEurMinor: 10_000_00n, outflowCapEurMinor: 10_000_00n },
    { requiredGates: (1n << 1n) | (1n << 2n) | (1n << 4n), inflowCapEurMinor: UINT256_MAX, outflowCapEurMinor: UINT256_MAX },
]

// Per-ordinal caps + the next tier's verification ask, kept in lockstep with
// FOUR_TIER_POLICY above so story states read like real chain derivations.
const TIER_LADDER: Record<PlayerTier, {
    inflowCap: number | null
    outflowCap: number | null
    next: PlayerActivityState['nextTier']
}> = {
    T0: {
        inflowCap: 900_00,
        outflowCap: 500_00,
        next: { tier: 'T1', missingGates: 1n << 1n, inflowCapEurMinor: 2_000_00, outflowCapEurMinor: 2_000_00 },
    },
    T1: {
        inflowCap: 2_000_00,
        outflowCap: 2_000_00,
        next: { tier: 'T2', missingGates: 1n << 2n, inflowCapEurMinor: 10_000_00, outflowCapEurMinor: 10_000_00 },
    },
    T2: {
        inflowCap: 10_000_00,
        outflowCap: 10_000_00,
        next: { tier: 'T3', missingGates: 1n << 4n, inflowCapEurMinor: null, outflowCapEurMinor: null },
    },
    T3: { inflowCap: null, outflowCap: null, next: null },
    T4: { inflowCap: null, outflowCap: null, next: null },
}

const passed = (g: GateType): [GateType, GateRecord] => [g, { status: 'passed' }]

function bitmapFor(gates: GateType[]): bigint {
    return gates.reduce((acc, g) => acc | (1n << BigInt(GATE_BIT_POSITION[g])), 0n)
}

const T1_GATES: Partial<Record<GateType, GateRecord>> = Object.fromEntries([
    passed('photo_id'),
]) as Partial<Record<GateType, GateRecord>>

const T1_BITMAP = bitmapFor(['photo_id'])

const T2_GATES: Partial<Record<GateType, GateRecord>> = Object.fromEntries([
    passed('photo_id'),
    passed('proof_of_address'),
]) as Partial<Record<GateType, GateRecord>>

const T2_BITMAP = bitmapFor(['photo_id', 'proof_of_address'])

function flow(used: number, cap: number | null) {
    if (cap === null) {
        return { capEurMinor: null, usedEurMinor: used, headroomEurMinor: Number.MAX_SAFE_INTEGER, ratio: 0 }
    }
    return {
        capEurMinor: cap,
        usedEurMinor: used,
        headroomEurMinor: Math.max(0, cap - used),
        ratio: cap > 0 ? Math.min(used / cap, 1) : 1,
    }
}

function state(opts: {
    currentTier: PlayerTier
    entered: number
    won: number
    claimed?: number
    largestSingleWin?: number
    pendingClaim?: number
}): PlayerActivityState {
    const ladder = TIER_LADDER[opts.currentTier]
    const claimed = opts.claimed ?? 0
    return {
        currentTier: opts.currentTier,
        cumWageredEurMinor: opts.entered,
        cumWonEurMinor: opts.won,
        cumClaimsEurMinor: claimed,
        largestSingleWinEurMinor: opts.largestSingleWin ?? opts.won,
        inflow: flow(opts.entered, ladder.inflowCap),
        outflow: flow(claimed, ladder.outflowCap),
        nextTier: ladder.next,
        pendingClaimEurMinor: opts.pendingClaim ?? 0,
    }
}

const noop = () => { /* storybook */ }

function baseArgs(over: Partial<AccountDialogViewProps>): AccountDialogViewProps {
    return {
        open: true,
        onOpenChange: noop,
        state: undefined,
        draw: false,
        prizePoolContext: undefined,
        kycGates: {},
        onChainGates: 0n,
        tiers: FOUR_TIER_POLICY,
        eth: 0n,
        weth: 0n,
        wageredEurMinor: 0n,
        wonEurMinor: 0n,
        profitEurMinor: 0n,
        isCompliant: false,
        decision: null,
        isClaiming: false,
        claimRequestPending: false,
        opStatus: undefined,
        opError: undefined,
        onClaim: noop,
        onReleasePending: noop,
        onVerify: noop,
        onClearDecision: noop,
        ...over,
    }
}

// Mid-tier player, no banners, real winnings visible. Shows the dialog at its
// quietest reading.
export const CleanT2: Story = {
    args: baseArgs({
        state: state({
            currentTier: 'T2',
            entered: 1_200_00,
            won: 7_500_00,
            largestSingleWin: 7_500_00,
        }),
        kycGates: T2_GATES,
        onChainGates: T2_BITMAP,
        wageredEurMinor: 1_200_00n,
        wonEurMinor: 7_500_00n,
        profitEurMinor: 6_300_00n,
        eth: 0n,
        weth: 0n,
        isCompliant: true,
    }),
}

// Connected player, T0, nothing won yet, no held winnings. Confirms the
// no-winnings forecast copy describes the single-win-limit escrow mechanic and
// reads non-noisy at T0 with no held funds.
export const NoWinnings_T0Idle: Story = {
    args: baseArgs({
        state: state({
            currentTier: 'T0',
            entered: 50_00,
            won: 0,
            largestSingleWin: 0,
        }),
        kycGates: {},
        wageredEurMinor: 50_00n,
        wonEurMinor: 0n,
        profitEurMinor: 0n,
        eth: 0n,
        weth: 0n,
        isCompliant: false,
    }),
}

// Compliant T1 with ETH + WETH ready to claim — the happy claim path.
export const AllClaimable_T1: Story = {
    args: baseArgs({
        state: state({
            currentTier: 'T1',
            entered: 100_00,
            won: 850_00,
            largestSingleWin: 700_00,
        }),
        kycGates: T1_GATES,
        onChainGates: T1_BITMAP,
        wageredEurMinor: 100_00n,
        wonEurMinor: 850_00n,
        profitEurMinor: 750_00n,
        eth: 250_000_000_000_000_000n, // 0.25 ETH
        weth: 80_000_000_000_000_000n, // 0.08 WETH
        isCompliant: true,
    }),
}

// T0 with claimable balance AND held winnings — the cap-split branch surfaces
// both "Available now" and "Held until verification" (claim-side ID + address
// verification, never SoF/SoW).
export const CapSplit_T0: Story = {
    args: baseArgs({
        state: state({
            currentTier: 'T0',
            entered: 200_00,
            won: 1_500_00,
            largestSingleWin: 1_500_00,
            pendingClaim: 600_00,
        }),
        kycGates: {},
        wageredEurMinor: 200_00n,
        wonEurMinor: 1_500_00n,
        profitEurMinor: 1_300_00n,
        eth: 150_000_000_000_000_000n,
        weth: 0n,
        isCompliant: false,
    }),
}

// T1 holding back winnings — the post-T1 release branch shows a single Release
// button instead of the cap-split pair.
export const PostT1Release: Story = {
    args: baseArgs({
        state: state({
            currentTier: 'T1',
            entered: 500_00,
            won: 12_000_00,
            largestSingleWin: 12_000_00,
            pendingClaim: 3_000_00,
        }),
        kycGates: T1_GATES,
        onChainGates: T1_BITMAP,
        wageredEurMinor: 500_00n,
        wonEurMinor: 12_000_00n,
        profitEurMinor: 11_500_00n,
        eth: 1_200_000_000_000_000_000n, // 1.2 ETH
        weth: 0n,
        isCompliant: true,
    }),
}

const KYC_UPGRADE_DECISION: ClaimDecision = {
    allow: false,
    reason: 'Tier 0 cap exceeded',
    requiredAction: 'KYC_UPGRADE',
}

// A claim came back rejected — surfaces the ClaimDecisionView with retry +
// verify CTAs instead of the success path.
export const ClaimDecisionRejected: Story = {
    args: baseArgs({
        state: state({
            currentTier: 'T0',
            entered: 100_00,
            won: 2_500_00,
            largestSingleWin: 2_500_00,
        }),
        kycGates: {},
        wageredEurMinor: 100_00n,
        wonEurMinor: 2_500_00n,
        profitEurMinor: 2_400_00n,
        eth: 500_000_000_000_000_000n,
        weth: 0n,
        isCompliant: false,
        decision: KYC_UPGRADE_DECISION,
    }),
}

// Held winnings only, no on-chain claimable balance. Banner is the only callout.
export const PendingClaimOnly: Story = {
    args: baseArgs({
        state: state({
            currentTier: 'T0',
            entered: 300_00,
            won: 1_800_00,
            largestSingleWin: 1_800_00,
            pendingClaim: 900_00,
        }),
        kycGates: {},
        wageredEurMinor: 300_00n,
        wonEurMinor: 1_800_00n,
        profitEurMinor: 1_500_00n,
        eth: 0n,
        weth: 0n,
        isCompliant: false,
    }),
}
