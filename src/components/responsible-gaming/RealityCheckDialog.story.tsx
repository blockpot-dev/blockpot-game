import { Meta, StoryObj } from '@storybook/react'
import RealityCheckDialog from './RealityCheckDialog'

const meta: Meta<typeof RealityCheckDialog> = {
    component: RealityCheckDialog,
}
export default meta
type Story = StoryObj<typeof RealityCheckDialog>

export const WithGetHelp: Story = {
    args: {
        open: true,
        onOpenChange: () => {},
        sessionDurationLabel: '1 hour 12 minutes',
        netSpendLabel: '€24.50',
        onContinue: () => {},
        onStop: () => {},
        onGetHelp: () => {},
    },
}

export const WithoutGetHelp: Story = {
    args: {
        open: true,
        onOpenChange: () => {},
        sessionDurationLabel: '25 minutes',
        netSpendLabel: '€0',
        onContinue: () => {},
        onStop: () => {},
    },
}
