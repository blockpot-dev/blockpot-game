import { Meta, StoryObj } from '@storybook/react'
import PrizePool from './PrizePool'
import { parseEther } from 'viem'

const meta: Meta<typeof PrizePool> = {
    component: PrizePool,
    decorators: [
        (Story) => (
            <div style={{ width: 420, height: 252, display: 'flex' }}>
                <Story />
            </div>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof PrizePool>

export const Funded: Story = {
    args: { nativeAmount: parseEther('12.5'), fiatAmountFormatted: '$31,250' },
}

/** First pots read has not resolved yet — skeleton instead of a misleading 0. */
export const Loading: Story = {
    args: { nativeAmount: 0n, fiatAmountFormatted: '$0', isLoading: true },
}
