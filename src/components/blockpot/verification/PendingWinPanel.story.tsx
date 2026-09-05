import { Meta, StoryObj } from '@storybook/react'
import PendingWinPanel from './PendingWinPanel'

// Surface 2: a prize above what the player can currently claim.
//
// Read the copy against the settled framing — the prize is theirs, it is safe,
// verification releases it. Not "on hold", not "pending review", not "locked".
// The amount is always shown in full: nothing about the prize is gated, only
// the exit.

const meta: Meta<typeof PendingWinPanel> = {
    component: PendingWinPanel,
    parameters: { layout: 'centered' },
    args: { onVerify: () => {} },
}
export default meta

type Story = StoryObj<typeof PendingWinPanel>

export const Default: Story = {
    args: { escrowedEurMinor: 250_000 },
}

// A large prize. Worth eyeballing that the figure does not wrap or truncate at
// the display size — this is the number the player cares most about.
export const LargePrize: Story = {
    args: { escrowedEurMinor: 4_500_000 },
}

// The stake-recovery rule (BLO-733) can pay out a player's net losses at win
// time, so what waits in escrow is often a partial remainder rather than the
// whole prize. Small residuals are a normal case, not an edge one.
export const PartialRemainder: Story = {
    args: { escrowedEurMinor: 7_350 },
}
