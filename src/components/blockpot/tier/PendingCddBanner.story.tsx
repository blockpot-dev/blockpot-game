import { Meta, StoryObj } from '@storybook/react'
import PendingCddBanner from './PendingCddBanner'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

const meta: Meta<typeof PendingCddBanner> = {
    component: PendingCddBanner,
}

export default meta

type Story = StoryObj<typeof PendingCddBanner>

const T0_INFLOW_CAP = 900_00
const T0_OUTFLOW_CAP = 500_00

// A T0 player whose winnings exceed the outflow-cap headroom by
// `pendingEurMinor` — the slice the banner says is safe and waiting.
function state(pendingEurMinor: number): PlayerActivityState {
    const won = T0_OUTFLOW_CAP + pendingEurMinor
    return {
        currentTier: 'T0',
        cumWageredEurMinor: 0,
        cumWonEurMinor: won,
        cumClaimsEurMinor: 0,
        largestSingleWinEurMinor: won,
        inflow: {
            capEurMinor: T0_INFLOW_CAP,
            usedEurMinor: 0,
            headroomEurMinor: T0_INFLOW_CAP,
            ratio: 0,
        },
        outflow: {
            capEurMinor: T0_OUTFLOW_CAP,
            usedEurMinor: 0,
            headroomEurMinor: T0_OUTFLOW_CAP,
            ratio: 0,
        },
        nextTier: {
            tier: 'T1',
            missingGates: 1n << 1n,
            inflowCapEurMinor: 2_000_00,
            outflowCapEurMinor: 2_000_00,
        },
        pendingClaimEurMinor: pendingEurMinor,
    }
}

const noop = () => { /* storybook */ }

export const None: Story = { args: { state: state(0), onVerify: noop } }
export const SmallPrize: Story = { args: { state: state(2_500_00), onVerify: noop } }
export const LargePrize: Story = { args: { state: state(125_000_00), onVerify: noop } }
