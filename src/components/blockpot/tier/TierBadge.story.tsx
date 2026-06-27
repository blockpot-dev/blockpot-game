import { Meta, StoryObj } from '@storybook/react'
import TierBadge from './TierBadge'

const meta: Meta<typeof TierBadge> = {
    component: TierBadge,
}

export default meta

type Story = StoryObj<typeof TierBadge>

export const Tier0: Story = { args: { tier: 'T0' } }
export const Tier1: Story = { args: { tier: 'T1' } }
export const Tier2: Story = { args: { tier: 'T2' } }
export const Tier3: Story = { args: { tier: 'T3' } }
export const Tier4: Story = { args: { tier: 'T4' } }
export const Small: Story = { args: { tier: 'T2', size: 'sm' } }
