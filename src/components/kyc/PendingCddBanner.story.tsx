import { Meta, StoryObj } from '@storybook/react'
import PendingCddBanner from './PendingCddBanner'
import { PlayerKycStatus } from '@/hooks/player/usePlayerKyc'

const meta: Meta<typeof PendingCddBanner> = {
    component: PendingCddBanner,
}
export default meta
type Story = StoryObj<typeof PendingCddBanner>

function status(pendingEurMinor: number): PlayerKycStatus {
    return {
        currentTier: 'T0',
        gates: {},
        pendingCddEurMinor: pendingEurMinor,
    }
}

export const None: Story = { args: { status: status(0) } }
export const SmallPrize: Story = { args: { status: status(2_500_00) } }
export const LargePrize: Story = { args: { status: status(125_000_00) } }
