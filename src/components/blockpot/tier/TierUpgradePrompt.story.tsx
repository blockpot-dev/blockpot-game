import { Meta, StoryObj } from '@storybook/react'
import TierUpgradePrompt from './TierUpgradePrompt'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

const meta: Meta<typeof TierUpgradePrompt> = {
    component: TierUpgradePrompt,
}

export default meta

type Story = StoryObj<typeof TierUpgradePrompt>

// T0 Phase 1 caps: €900 in / €500 out.
const T0_INFLOW_CAP = 900_00
const T0_OUTFLOW_CAP = 500_00

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
        inflow: flow(entered, T0_INFLOW_CAP),
        outflow: flow(claimed, T0_OUTFLOW_CAP),
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

export const NotYet: Story = {
    args: { state: state({ entered: 200_00, claimed: 100_00 }), onVerify: noop },
}
export const InflowEightyPercent: Story = {
    args: { state: state({ entered: 720_00 }), onVerify: noop },
}
export const InflowNinetyFivePercent: Story = {
    args: { state: state({ entered: 860_00 }), onVerify: noop },
}
export const OutflowEightyPercent: Story = {
    args: { state: state({ claimed: 400_00 }), onVerify: noop },
}
export const OutflowNinetyFivePercent: Story = {
    args: { state: state({ claimed: 480_00 }), onVerify: noop },
}
// Both directions past warn — renders one banner per direction so the player
// sees a distinct "keep playing" prompt and a "keep claiming" prompt.
export const BothDirectionsWarn: Story = {
    args: { state: state({ entered: 720_00, claimed: 400_00 }), onVerify: noop },
}
