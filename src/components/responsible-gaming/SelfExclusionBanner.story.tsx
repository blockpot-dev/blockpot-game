import { Meta, StoryObj } from '@storybook/react'
import { SelfExclusionBannerView } from './SelfExclusionBanner'
import { SelfExclusionRecord } from '@/hooks/responsible-gaming/useSelfExclusion'

const meta: Meta<typeof SelfExclusionBannerView> = {
    component: SelfExclusionBannerView,
}
export default meta
type Story = StoryObj<typeof SelfExclusionBannerView>

const baseRecord = (overrides: Partial<SelfExclusionRecord>): SelfExclusionRecord => ({
    id: 'fixture',
    duration: '7d',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    appliedBy: 'player',
    ...overrides,
})

export const NoExclusion: Story = {
    args: { record: null, hasClaimableWinnings: false },
}

export const SevenDayWithClaimableWinnings: Story = {
    args: {
        record: baseRecord({ duration: '7d' }),
        hasClaimableWinnings: true,
    },
}

export const SixMonthNoClaimableWinnings: Story = {
    args: {
        record: baseRecord({
            duration: '6mo',
            endsAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        hasClaimableWinnings: false,
    },
}

export const PermanentMlroWithWinnings: Story = {
    args: {
        record: baseRecord({
            duration: 'permanent',
            endsAt: null,
            appliedBy: 'mlro',
        }),
        hasClaimableWinnings: true,
    },
}
