import { Meta, StoryObj } from '@storybook/react'
import { SelfExclusionPanelView } from './SelfExclusionPanel'
import { SelfExclusionRecord } from '@/hooks/responsible-gaming/useSelfExclusion'

const meta: Meta<typeof SelfExclusionPanelView> = {
    component: SelfExclusionPanelView,
    decorators: [
        (Story) => (
            <div className='max-w-[820px] mx-auto p-4'>
                <Story />
            </div>
        ),
    ],
}
export default meta
type Story = StoryObj<typeof SelfExclusionPanelView>

const noop = () => { /* storybook */ }

export const Disconnected: Story = {
    args: {
        walletConnected: false,
        active: null,
        onApply: noop,
    },
}

export const Loading: Story = {
    args: {
        walletConnected: true,
        active: null,
        isLoading: true,
        onApply: noop,
    },
}

export const FormDefault: Story = {
    args: {
        walletConnected: true,
        active: null,
        onApply: noop,
    },
}

export const Submitting: Story = {
    args: {
        walletConnected: true,
        active: null,
        submitting: true,
        onApply: noop,
    },
}

export const SubmitError: Story = {
    args: {
        walletConnected: true,
        active: null,
        submitError: 'Service temporarily unavailable. Please retry.',
        onApply: noop,
    },
}

const activeRecord: SelfExclusionRecord = {
    id: 'fixture',
    duration: '7d',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    appliedBy: 'player',
}

export const ActivePlayerInitiated: Story = {
    args: {
        walletConnected: true,
        active: activeRecord,
        onApply: noop,
    },
}

export const ActiveMlroPermanent: Story = {
    args: {
        walletConnected: true,
        active: {
            ...activeRecord,
            duration: 'permanent',
            endsAt: null,
            appliedBy: 'mlro',
        },
        onApply: noop,
    },
}
