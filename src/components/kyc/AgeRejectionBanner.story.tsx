import { Meta, StoryObj } from '@storybook/react'
import AgeRejectionBanner from './AgeRejectionBanner'
import { PlayerKycStatus } from '@/hooks/player/usePlayerKyc'

const meta: Meta<typeof AgeRejectionBanner> = {
    component: AgeRejectionBanner,
}
export default meta
type Story = StoryObj<typeof AgeRejectionBanner>

const baseStatus: PlayerKycStatus = {
    currentTier: 'T0',
    gates: {},
    pendingCddEurMinor: 0,
}

export const None: Story = { args: { status: baseStatus } }

export const AgeFailure: Story = {
    args: {
        status: {
            ...baseStatus,
            gates: {
                photo_id: { status: 'failed', rejectionReason: 'applicant appears under 18' },
            },
        },
    },
}

// Not age-related: banner stays hidden because rejection reason doesn't mention age.
export const NonAgeFailure: Story = {
    args: {
        status: {
            ...baseStatus,
            gates: {
                photo_id: { status: 'failed', rejectionReason: 'document quality too low' },
            },
        },
    },
}
