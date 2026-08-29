import { Meta, StoryObj } from '@storybook/react'
import EntryButton from './EntryButton'

const meta: Meta<typeof EntryButton> = {
    component: EntryButton,
    args: {
        enter: () => {},
        status: 'idle',
    },
}

export default meta
type Story = StoryObj<typeof EntryButton>

// BLO-748: idle / pending / success labels use entry vocabulary —
// ENTER DRAW, ENTERING…, ENTERED. Never purchase / ticket.
export const Enabled: Story = {
    args: { canEnter: true },
}

export const Entering: Story = {
    args: { canEnter: true, status: 'pending' },
}

// BLO-734: a player whose registry status forbids entering (account under
// review / closed) sees a disabled CTA carrying the reason as its tooltip —
// never an enabled REGISTER TO ENTER button.
export const DisabledAccountUnderReview: Story = {
    args: {
        canEnter: false,
        disabledReason: 'Your account is under review. Entries are paused until verification is complete.',
    },
}

export const DisabledAccountClosed: Story = {
    args: {
        canEnter: false,
        disabledReason: 'This account has been closed. If you believe this is an error, contact support.',
    },
}

export const RegistrationMode: Story = {
    args: {
        registration: {
            register: () => {},
            isSigning: false,
            isPending: false,
            isFailed: false,
            disabled: false,
        },
    },
}
