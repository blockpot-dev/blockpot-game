import { Meta, StoryObj } from '@storybook/react'
import { _RealityCheckHost } from './RealityCheckHost'

// The container half owns interval scheduling + localStorage hooks; the story
// exercises the presentational half in its fired state.
const meta: Meta<typeof _RealityCheckHost> = {
    component: _RealityCheckHost,
}
export default meta
type Story = StoryObj<typeof _RealityCheckHost>

export const PromptFired: Story = {
    args: {
        open: true,
        onOpenChange: () => {},
        sessionDurationLabel: '2 hours 5 minutes',
        netSpendLabel: '€12.30',
        onContinue: () => {},
        onStop: () => {},
        onGetHelp: () => {},
    },
}
