import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import TierBreakdown, { TierBreakdownProps } from './TierBreakdown'
import type { TierPolicy } from '@/hooks/contracts/kyc/useActivePolicy'
import type { GateRecord, GateType } from '@/hooks/player/usePlayerKyc'
import { GATE_BIT_POSITION } from '@/lib/kyc/gateBitmask'

const meta: Meta<typeof TierBreakdown> = {
    component: TierBreakdown,
    decorators: [
        (Story) => (
            <div style={{ minWidth: 560, padding: 24 }}>
                <Story />
            </div>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof TierBreakdown>

const UINT256_MAX = (1n << 256n) - 1n

// Mirrors the seeded gaming-service KYCPolicy after task 94: gates are
// shared per tier; only the cap amounts split by direction. Each tier
// carries a gross cumulative inflow cap (entries, gated on entry) and a
// gross cumulative outflow cap (claims, gated on exit). The top tier sits
// at the unlimited sentinel on both fields.
const FOUR_TIER_POLICY: TierPolicy[] = [
    { requiredGates: 0n, inflowCapEurMinor: 900_00n, outflowCapEurMinor: 500_00n },
    { requiredGates: 1n << 1n, inflowCapEurMinor: 2_000_00n, outflowCapEurMinor: 2_000_00n },
    { requiredGates: (1n << 1n) | (1n << 2n), inflowCapEurMinor: 10_000_00n, outflowCapEurMinor: 10_000_00n },
    { requiredGates: (1n << 1n) | (1n << 2n) | (1n << 4n), inflowCapEurMinor: UINT256_MAX, outflowCapEurMinor: UINT256_MAX },
]

const THREE_TIER_POLICY: TierPolicy[] = [
    { requiredGates: 0n, inflowCapEurMinor: 900_00n, outflowCapEurMinor: 500_00n },
    { requiredGates: 1n << 1n, inflowCapEurMinor: 2_000_00n, outflowCapEurMinor: 2_000_00n },
    { requiredGates: (1n << 1n) | (1n << 2n), inflowCapEurMinor: UINT256_MAX, outflowCapEurMinor: UINT256_MAX },
]

const passed = (g: GateType): [GateType, GateRecord] => [g, { status: 'passed' }]

// Stories assume the on-chain bitmap mirrors any gates passed in the
// gaming-service map — production has them drift, but the stories model
// the steady-state where the chain has caught up.
function bitmapFor(gates: GateType[]): bigint {
    return gates.reduce((acc, g) => acc | (1n << BigInt(GATE_BIT_POSITION[g])), 0n)
}

const noop = () => { /* storybook */ }

// Wraps the controlled tab selection in local state so stories stay
// interactive without each one wiring its own useState.
function StatefulTierBreakdown(props: Omit<TierBreakdownProps, 'selectedTierIdx' | 'onSelectedTierChange'>) {
    const initialIdx = parseInt(props.currentTier.slice(1), 10) || 0
    const [selectedTierIdx, setSelectedTierIdx] = useState<number>(
        Math.min(Math.max(initialIdx, 0), Math.max(0, props.tiers.length - 1)),
    )
    return (
        <TierBreakdown
            {...props}
            selectedTierIdx={selectedTierIdx}
            onSelectedTierChange={setSelectedTierIdx}
        />
    )
}

export const FourTier_T0Player: Story = {
    render: (args) => <StatefulTierBreakdown {...args} />,
    args: {
        currentTier: 'T0',
        gates: {},
        onChainGates: 0n,
        tiers: FOUR_TIER_POLICY,
        nextTier: {
            tier: 'T1',
            missingGates: 1n << 1n,
            inflowCapEurMinor: 2_000_00,
            outflowCapEurMinor: 2_000_00,
        },
        onVerify: noop,
    },
}

export const FourTier_T2Player: Story = {
    render: (args) => <StatefulTierBreakdown {...args} />,
    args: {
        currentTier: 'T2',
        gates: Object.fromEntries([
            passed('photo_id'),
            passed('proof_of_address'),
        ]) as Partial<Record<GateType, GateRecord>>,
        onChainGates: bitmapFor(['photo_id', 'proof_of_address']),
        tiers: FOUR_TIER_POLICY,
        onVerify: noop,
    },
}

export const ThreeTierPolicy: Story = {
    render: (args) => <StatefulTierBreakdown {...args} />,
    args: {
        currentTier: 'T1',
        gates: Object.fromEntries([passed('photo_id')]) as Partial<Record<GateType, GateRecord>>,
        onChainGates: bitmapFor(['photo_id']),
        tiers: THREE_TIER_POLICY,
        onVerify: noop,
    },
}
