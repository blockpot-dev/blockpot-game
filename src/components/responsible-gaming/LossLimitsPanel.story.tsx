import { Meta, StoryObj } from '@storybook/react'
import { LossLimitsPanelView } from './LossLimitsPanel'
import { LossLimitsState } from '@/hooks/responsible-gaming/useLossLimits'

const meta: Meta<typeof LossLimitsPanelView> = {
    component: LossLimitsPanelView,
    decorators: [
        (Story) => (
            <div className='max-w-[820px] mx-auto p-4'>
                <Story />
            </div>
        ),
    ],
}
export default meta
type Story = StoryObj<typeof LossLimitsPanelView>

const noop = () => { /* storybook */ }

const empty: LossLimitsState = { pending: [] }

const configured: LossLimitsState = {
    daily: { amountEurMinor: 10_000, effectiveFrom: new Date().toISOString() },
    weekly: { amountEurMinor: 50_000, effectiveFrom: new Date().toISOString() },
    monthly: { amountEurMinor: 200_000, effectiveFrom: new Date().toISOString() },
    pending: [],
}

const withPending: LossLimitsState = {
    ...configured,
    pending: [
        {
            id: 'pending-1',
            period: 'weekly',
            newAmountEurMinor: 75_000,
            direction: 'increase',
            effectiveAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
    ],
}

export const Disconnected: Story = {
    args: {
        walletConnected: false,
        state: undefined,
        onSet: noop,
        onCancelPending: noop,
    },
}

export const Loading: Story = {
    args: {
        walletConnected: true,
        state: undefined,
        isLoading: true,
        onSet: noop,
        onCancelPending: noop,
    },
}

export const NoLimitsSet: Story = {
    args: {
        walletConnected: true,
        state: empty,
        onSet: noop,
        onCancelPending: noop,
    },
}

export const Configured: Story = {
    args: {
        walletConnected: true,
        state: configured,
        onSet: noop,
        onCancelPending: noop,
    },
}

export const PendingIncrease: Story = {
    args: {
        walletConnected: true,
        state: withPending,
        onSet: noop,
        onCancelPending: noop,
    },
}

export const QueryError: Story = {
    args: {
        walletConnected: true,
        state: undefined,
        queryError: true,
        onRetry: noop,
        onSet: noop,
        onCancelPending: noop,
    },
}

export const Saved: Story = {
    args: {
        walletConnected: true,
        state: configured,
        successMessage: 'Daily limit saved.',
        onSet: noop,
        onCancelPending: noop,
    },
}

export const SaveError: Story = {
    args: {
        walletConnected: true,
        state: configured,
        submitError: 'We couldn\'t save your limit. Please try again.',
        onSet: noop,
        onCancelPending: noop,
    },
}
