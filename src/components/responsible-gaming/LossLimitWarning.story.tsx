import { Meta, StoryObj } from '@storybook/react'
import { LossLimitWarningView } from './LossLimitWarning'
import { LossLimitsState } from '@/hooks/responsible-gaming/useLossLimits'

const meta: Meta<typeof LossLimitWarningView> = {
    component: LossLimitWarningView,
    decorators: [
        (Story) => (
            <div className='max-w-[420px] p-4'>
                <Story />
            </div>
        ),
    ],
}
export default meta
type Story = StoryObj<typeof LossLimitWarningView>

const configured: LossLimitsState = {
    daily: { amountEurMinor: 10_000, effectiveFrom: new Date().toISOString() },
    weekly: { amountEurMinor: 50_000, effectiveFrom: new Date().toISOString() },
    pending: [],
}

export const WithConfiguredLimits: Story = {
    args: { state: configured },
}

export const NoConfiguredLimits: Story = {
    args: { state: { pending: [] } },
}
