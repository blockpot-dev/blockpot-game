import { Meta, StoryObj } from '@storybook/react'
import { ReferralEarningsView } from './ReferralEarningsSection'

const meta: Meta<typeof ReferralEarningsView> = {
    component: ReferralEarningsView,
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 420 }}>
                <Story />
            </div>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof ReferralEarningsView>

const noop = () => undefined

export const Active: Story = {
    args: {
        record: {
            status: 'active',
            effectiveShareBps: 1000,
            accrued: 100000000000000000n,
            lifetimeEarned: 300000000000000000n,
            lifetimeClaimed: 200000000000000000n,
        },
        onClaim: noop,
        isClaiming: false,
    },
}

export const ActiveNothingToClaim: Story = {
    args: {
        record: {
            status: 'active',
            effectiveShareBps: 2500,
            accrued: 0n,
            lifetimeEarned: 500000000000000000n,
            lifetimeClaimed: 500000000000000000n,
        },
        onClaim: noop,
        isClaiming: false,
    },
}

export const Suspended: Story = {
    args: {
        record: {
            status: 'suspended',
            effectiveShareBps: 1000,
            accrued: 50000000000000000n,
            lifetimeEarned: 50000000000000000n,
            lifetimeClaimed: 0n,
        },
        onClaim: noop,
        isClaiming: false,
    },
}

export const Terminated: Story = {
    args: {
        record: {
            status: 'terminated',
            effectiveShareBps: 1000,
            accrued: 0n,
            lifetimeEarned: 50000000000000000n,
            lifetimeClaimed: 0n,
        },
        onClaim: noop,
        isClaiming: false,
    },
}

export const Claiming: Story = {
    args: {
        record: {
            status: 'active',
            effectiveShareBps: 1000,
            accrued: 100000000000000000n,
            lifetimeEarned: 100000000000000000n,
            lifetimeClaimed: 0n,
        },
        onClaim: noop,
        isClaiming: true,
    },
}

// Loading and error states live in the hook-connected default export;
// see ReferralEarningsSection.test.tsx for their assertions.
