import { Meta, StoryObj } from '@storybook/react'
import InlineVerification from './InlineVerification'

// Surface 1: verification arrives at the blocked action. One story per reason,
// because the reason sentence is the whole surface — everything else is the
// embedded Sumsub flow.
//
// Read these against the messaging guardrails: no tier name, no cap, no
// "withdraw" or "deposit". A player is claiming a prize they already hold, or
// entering a draw; they are never depositing and never being custodied.

const meta: Meta<typeof InlineVerification> = {
    component: InlineVerification,
    parameters: { layout: 'centered' },
    args: { onResume: () => {} },
}
export default meta

type Story = StoryObj<typeof InlineVerification>

// The most common case: a prize larger than the player can currently claim.
// The amount is named because it is the thing they were trying to do.
export const ClaimOverHeadroom: Story = {
    args: { reason: { kind: 'claim_over_headroom', requiredEurMinor: 120_000 } },
}

// Claiming somewhere other than the wallet they entered from. No amount here —
// the size of the claim is not what triggered this.
export const ClaimToNewWallet: Story = {
    args: { reason: { kind: 'claim_new_wallet' } },
}

// The entry side. Names what they can still enter without verifying, so the
// player can choose a smaller entry instead of verifying.
export const StakeWouldCrossCap: Story = {
    args: { reason: { kind: 'stake_would_cross_cap', capEurMinor: 90_000 } },
}

// With a way out. The cancel affordance is opt-in: a surface reached from a
// modal wants it, one rendered inline under a paused action often does not.
export const WithCancel: Story = {
    args: { reason: { kind: 'claim_new_wallet' }, onCancel: () => {} },
}
