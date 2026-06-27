import { Meta, StoryObj } from '@storybook/react'
import JackpotPreCommitBanner from './JackpotPreCommitBanner'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

const meta: Meta<typeof JackpotPreCommitBanner> = {
    component: JackpotPreCommitBanner,
}

export default meta

type Story = StoryObj<typeof JackpotPreCommitBanner>

const noop = () => { /* storybook */ }

// A player whose remaining outflow headroom is `headroomEurMinor` — the
// banner appears once the jackpot exceeds it.
function state(headroomEurMinor: number | null): PlayerActivityState {
    const unlimited = headroomEurMinor === null
    return {
        currentTier: unlimited ? 'T4' : 'T0',
        cumWageredEurMinor: 0,
        cumWonEurMinor: 0,
        cumClaimsEurMinor: 0,
        largestSingleWinEurMinor: 0,
        inflow: {
            capEurMinor: unlimited ? null : 900_00,
            usedEurMinor: 0,
            headroomEurMinor: unlimited ? Number.MAX_SAFE_INTEGER : 900_00,
            ratio: 0,
        },
        outflow: {
            capEurMinor: unlimited ? null : (headroomEurMinor ?? 0),
            usedEurMinor: 0,
            headroomEurMinor: unlimited ? Number.MAX_SAFE_INTEGER : (headroomEurMinor ?? 0),
            ratio: 0,
        },
        nextTier: unlimited
            ? null
            : {
                tier: 'T1',
                missingGates: 1n << 1n,
                inflowCapEurMinor: 2_000_00,
                outflowCapEurMinor: 2_000_00,
            },
        pendingClaimEurMinor: 0,
    }
}

// T0 player with €500 of outflow headroom — a €5,000 pot would mostly be held.
export const HeldSliceAtT0: Story = {
    args: {
        state: state(500_00),
        context: { currentJackpotEurMinor: 5_000_00, tierRequiredToFullyClaim: 'T2' },
        onVerify: noop,
    },
}

// Larger jackpot, same headroom — nearly the whole win would wait in escrow.
export const LargeJackpot: Story = {
    args: {
        state: state(500_00),
        context: { currentJackpotEurMinor: 125_000_00, tierRequiredToFullyClaim: 'T2' },
        onVerify: noop,
    },
}

// The whole jackpot fits inside headroom — banner is hidden.
export const FitsInHeadroom: Story = {
    args: {
        state: state(10_000_00),
        context: { currentJackpotEurMinor: 5_000_00, tierRequiredToFullyClaim: 'T2' },
        onVerify: noop,
    },
}

// Unlimited top tier — banner never renders.
export const UnlimitedTier: Story = {
    args: {
        state: state(null),
        context: { currentJackpotEurMinor: 125_000_00, tierRequiredToFullyClaim: 'T2' },
        onVerify: noop,
    },
}
