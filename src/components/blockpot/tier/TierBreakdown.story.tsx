import { Meta, StoryObj } from '@storybook/react'
import TierBreakdown from './TierBreakdown'
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

const pending = (g: GateType): [GateType, GateRecord] => [g, { status: 'pending' }]

function bitmapFor(gates: GateType[]): bigint {
    return gates.reduce((acc, g) => acc | (1n << BigInt(GATE_BIT_POSITION[g])), 0n)
}

const noop = () => { /* storybook */ }

// New player: identity is the one gate missing before larger prizes can be claimed.
export const IdentityMissing: Story = {
    args: {
        gates: {},
        onChainGates: 0n,
        nextTier: { tier: 'T1', missingGates: 1n << 1n, inflowCapEurMinor: 2_000_00, outflowCapEurMinor: 2_000_00 },
        onVerify: noop,
    },
}

// Identity submitted to Sumsub and awaiting review.
export const IdentityPending: Story = {
    args: {
        gates: Object.fromEntries([pending('photo_id')]) as Partial<Record<GateType, GateRecord>>,
        onChainGates: 0n,
        nextTier: { tier: 'T1', missingGates: 1n << 1n, inflowCapEurMinor: 2_000_00, outflowCapEurMinor: 2_000_00 },
        onVerify: noop,
    },
}

// Identity passed on-chain; address is the next step.
export const AddressMissing: Story = {
    args: {
        gates: {},
        onChainGates: bitmapFor(['photo_id']),
        nextTier: { tier: 'T2', missingGates: 1n << 2n, inflowCapEurMinor: 10_000_00, outflowCapEurMinor: 10_000_00 },
        onVerify: noop,
    },
}

// Chain policy requires a gate this build's table does not know — the
// fallback row keeps the checklist honest.
export const UnknownGate: Story = {
    args: {
        gates: {},
        onChainGates: bitmapFor(['photo_id', 'proof_of_address']),
        nextTier: { tier: 'T3', missingGates: (1n << 4n) | (1n << 20n), inflowCapEurMinor: null, outflowCapEurMinor: null },
        onVerify: noop,
    },
}

// Nothing left to verify.
export const NothingRequired: Story = {
    args: {
        gates: {},
        onChainGates: bitmapFor(['photo_id', 'proof_of_address', 'sof_documented']),
        nextTier: null,
        onVerify: noop,
    },
}
