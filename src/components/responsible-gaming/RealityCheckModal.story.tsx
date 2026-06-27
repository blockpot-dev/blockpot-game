import { Meta, StoryObj } from '@storybook/react'
import { RealityCheckModalView } from './RealityCheckModal'

const meta: Meta<typeof RealityCheckModalView> = {
    component: RealityCheckModalView,
}
export default meta
type Story = StoryObj<typeof RealityCheckModalView>

const noop = () => { /* storybook */ }

// First fire: a fresh session with the default 60-minute interval. Modest
// numbers so the layout shows the per-session EUR figures cleanly.
export const FirstFire: Story = {
    args: {
        open: true,
        elapsedMs: 60 * 60 * 1000,
        wageredEurFormatted: '€36.00',
        wonEurFormatted: '€12.00',
        onContinue: noop,
        onTakeBreak: noop,
        onSelfExclude: noop,
    },
}

// Subsequent fire: longer session, more activity. The "h Xm" elapsed copy
// kicks in here.
export const SubsequentFire: Story = {
    args: {
        open: true,
        elapsedMs: 3 * 60 * 60 * 1000 + 25 * 60 * 1000,
        wageredEurFormatted: '€162.20',
        wonEurFormatted: '€54.00',
        onContinue: noop,
        onTakeBreak: noop,
        onSelfExclude: noop,
    },
}

// Cancelled / closed: open=false renders nothing in the dialog. Story is here
// to make the closed state explicit.
export const Cancelled: Story = {
    args: {
        open: false,
        elapsedMs: 0,
        wageredEurFormatted: '€0.00',
        wonEurFormatted: '€0.00',
        onContinue: noop,
        onTakeBreak: noop,
        onSelfExclude: noop,
    },
}
