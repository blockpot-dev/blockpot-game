import { Meta, StoryObj } from '@storybook/react'
import SelfExclusionConfirmDialog from './SelfExclusionConfirmDialog'
import { estimateEndsAt } from './selfExclusionCopy'

const meta: Meta<typeof SelfExclusionConfirmDialog> = {
    component: SelfExclusionConfirmDialog,
}
export default meta
type Story = StoryObj<typeof SelfExclusionConfirmDialog>

const noop = () => { /* storybook */ }

export const SevenDay: Story = {
    args: {
        open: true,
        onOpenChange: noop,
        duration: '7d',
        endsAt: estimateEndsAt('7d'),
        onConfirm: noop,
    },
}

export const SixMonth: Story = {
    args: {
        open: true,
        onOpenChange: noop,
        duration: '6mo',
        endsAt: estimateEndsAt('6mo'),
        onConfirm: noop,
    },
}

export const Permanent: Story = {
    args: {
        open: true,
        onOpenChange: noop,
        duration: 'permanent',
        endsAt: null,
        onConfirm: noop,
    },
}

export const Submitting: Story = {
    args: {
        open: true,
        onOpenChange: noop,
        duration: '7d',
        endsAt: estimateEndsAt('7d'),
        onConfirm: noop,
        submitting: true,
    },
}

export const WithError: Story = {
    args: {
        open: true,
        onOpenChange: noop,
        duration: '24h',
        endsAt: estimateEndsAt('24h'),
        onConfirm: noop,
        error: 'Service unavailable. Please retry.',
    },
}
