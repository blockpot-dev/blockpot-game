import { Meta, StoryObj } from '@storybook/react'
import CapProximityNudge from './CapProximityNudge'

// Surface 3: the single 90% nudge.
//
// This component reads its own state from useVerificationState, so the stories
// below are the shown state only — the dismissed and below-threshold states
// render nothing at all, which is the point and is covered by the tests rather
// than by an empty Storybook frame.
//
// Check the copy names no tier, no cap and no figure. A player who dismisses
// has lost nothing: the identity check still arrives at the blocked action
// (Surface 1), so this is an offer to get it over with, not a warning.

const meta: Meta<typeof CapProximityNudge> = {
    component: CapProximityNudge,
    parameters: { layout: 'centered' },
    args: { onVerify: () => {} },
}
export default meta

type Story = StoryObj<typeof CapProximityNudge>

export const Shown: Story = {}

// Narrow container: the nudge sits inline above play surfaces, so the
// text-and-two-buttons row has to survive a constrained width without the
// actions wrapping under the copy awkwardly.
export const Narrow: Story = {
    decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
}
