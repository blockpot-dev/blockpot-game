import { Meta, StoryObj } from '@storybook/react'
import { ReferralBannerView } from './ReferralBanner'

const meta: Meta<typeof ReferralBannerView> = {
    component: ReferralBannerView,
    decorators: [
        (Story) => (
            <div style={{ width: 252 }}>
                <Story />
            </div>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof ReferralBannerView>

const noop = () => undefined

/** Collapsed disclosure — the default state above the Register button. */
export const Unbound: Story = {
    args: { referrer: null, code: '', onCodeChange: noop, checkStatus: 'idle' },
}

export const UnboundExpanded: Story = {
    args: { referrer: null, code: '', onCodeChange: noop, checkStatus: 'idle', defaultOpen: true },
}

export const ValidCode: Story = {
    args: { referrer: null, code: 'CRYPTOJOE', onCodeChange: noop, checkStatus: 'valid' },
}

export const InvalidCode: Story = {
    args: { referrer: null, code: 'NOSUCH', onCodeChange: noop, checkStatus: 'invalid' },
}

export const InactiveReferrerCode: Story = {
    args: { referrer: null, code: 'SUSPENDED_JOE', onCodeChange: noop, checkStatus: 'inactive' },
}

export const Bound: Story = {
    args: {
        referrer: '0x1111111111111111111111111111111111111111',
        code: '',
        onCodeChange: noop,
        checkStatus: 'idle',
    },
}
