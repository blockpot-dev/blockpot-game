import { Meta, StoryObj } from '@storybook/react'
import TierUpgradePrompt from './TierUpgradePrompt'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

const meta: Meta<typeof TierUpgradePrompt> = {
    component: TierUpgradePrompt,
}

export default meta

type Story = StoryObj<typeof TierUpgradePrompt>

// Phase 1 default caps: €900 in / €500 out. Never rendered — inputs only.
const INFLOW_CAP = 900_00
const OUTFLOW_CAP = 500_00

function flow(used: number, cap: number) {
    return {
        capEurMinor: cap,
        usedEurMinor: used,
        headroomEurMinor: Math.max(0, cap - used),
        ratio: cap > 0 ? Math.min(used / cap, 1) : 1,
    }
}

function state(opts: { entered?: number, claimed?: number }): PlayerActivityState {
    const entered = opts.entered ?? 0
    const claimed = opts.claimed ?? 0
    return {
        currentTier: 'T0',
        cumEnteredEurMinor: entered,
        cumWonEurMinor: 0,
        cumClaimsEurMinor: claimed,
        largestSingleWinEurMinor: 0,
        inflow: flow(entered, INFLOW_CAP),
        outflow: flow(claimed, OUTFLOW_CAP),
        nextTier: {
            tier: 'T1',
            missingGates: 1n << 1n,
            inflowCapEurMinor: 2_000_00,
            outflowCapEurMinor: 2_000_00,
        },
        pendingClaimEurMinor: 0,
    }
}

const noop = () => { /* storybook */ }

// Below 90% on both directions — nothing renders.
export const NotYet: Story = {
    args: { state: state({ entered: 720_00, claimed: 400_00 }), onVerify: noop },
}
// 90% of cumulative entries — the single dismissible nudge.
export const EntriesAtNinetyPercent: Story = {
    args: { state: state({ entered: 810_00 }), onVerify: noop },
}
// 90% of cumulative claims — same banner, same copy.
export const ClaimsAtNinetyPercent: Story = {
    args: { state: state({ claimed: 450_00 }), onVerify: noop },
}
// Both directions past 90% — still exactly one banner.
export const BothDirections: Story = {
    args: { state: state({ entered: 880_00, claimed: 490_00 }), onVerify: noop },
}
