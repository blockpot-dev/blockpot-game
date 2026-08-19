import { Meta, StoryObj } from '@storybook/react'
import NetFlowCard from './NetFlowCard'
import { DirectionalFlow, PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

const meta: Meta<typeof NetFlowCard> = {
    component: NetFlowCard,
    decorators: [
        (Story) => (
            <div style={{ minWidth: 480, padding: 24 }}>
                <Story />
            </div>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof NetFlowCard>

function flow(used: number, cap: number | null): DirectionalFlow {
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

type NetStateOptions = {
    entered?: number
    claimed?: number
    inflowCap?: number | null
    outflowCap?: number | null
    tier?: PlayerActivityState['currentTier']
}

// Keeps the cum counters and the per-direction flows coherent the way
// usePlayerActivityState derives them from the chain snapshot.
function state(options: NetStateOptions = {}): PlayerActivityState {
    const {
        entered = 0,
        claimed = 0,
        inflowCap = 10_000_00,
        outflowCap = 10_000_00,
        tier = 'T2',
    } = options
    return {
        currentTier: tier,
        cumWageredEurMinor: entered,
        cumWonEurMinor: claimed,
        cumClaimsEurMinor: claimed,
        largestSingleWinEurMinor: 0,
        inflow: flow(entered, inflowCap),
        outflow: flow(claimed, outflowCap),
        nextTier: tier === 'T4'
            ? null
            : {
                tier: 'T3',
                missingGates: 1n << 2n,
                inflowCapEurMinor: 50_000_00,
                outflowCapEurMinor: 50_000_00,
            },
        pendingClaimEurMinor: 0,
    }
}

// Net-in well under the entry cap — the everyday posture.
export const EnteredOk: Story = {
    args: { state: state({ entered: 415_00, claimed: 100_00 }) },
}

// Net-in past the 80% warn breakpoint — amber hero plus remaining caption.
export const EnteredWarn: Story = {
    args: { state: state({ entered: 8_750_00 }) },
}

// Net-in inside the 95% block zone — red hero, €X left caption.
export const EnteredBlocked: Story = {
    args: { state: state({ entered: 9_700_00 }) },
}

// Net-out: claims exceed entries, so the claim cap is the active one.
export const ClaimedNet: Story = {
    args: { state: state({ entered: 100_00, claimed: 415_00 }) },
}

// Net-out past the warn breakpoint of the claim cap.
export const ClaimedWarn: Story = {
    args: { state: state({ claimed: 8_750_00 }) },
}

// Entries and claims balance out exactly.
export const AllSquare: Story = {
    args: { state: state({ entered: 200_00, claimed: 200_00 }) },
}

// Top tier: both caps unlimited — neutral hero regardless of size.
export const UnlimitedT4: Story = {
    args: {
        state: state({
            entered: 120_000_00, inflowCap: null, outflowCap: null, tier: 'T4',
        }),
    },
}

// Net beyond the active cap — hero shows the true figure, zone clamps to block.
export const OverCap: Story = {
    args: { state: state({ entered: 12_000_00 }) },
}

// Hidden entirely when state hasn't resolved.
export const NoState: Story = {
    args: { state: undefined },
}
