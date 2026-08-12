import { Meta, StoryObj } from '@storybook/react'
import CoolOffStatusBanner from './CoolOffStatusBanner'

const meta: Meta<typeof CoolOffStatusBanner> = {
    component: CoolOffStatusBanner,
}
export default meta
type Story = StoryObj<typeof CoolOffStatusBanner>

const nowSeconds = Math.floor(Date.now() / 1000)

export const NotBlocked: Story = {
    args: { blockedUntil: 0n },
}

export const BlockedHours: Story = {
    args: { blockedUntil: BigInt(nowSeconds + 6 * 3600) },
}

export const BlockedDays: Story = {
    args: { blockedUntil: BigInt(nowSeconds + 3 * 24 * 3600) },
}
