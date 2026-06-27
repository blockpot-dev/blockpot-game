import { Meta, StoryObj } from '@storybook/react'
import { RealityCheckSettingsView } from './RealityCheckSettings'

const meta: Meta<typeof RealityCheckSettingsView> = {
    component: RealityCheckSettingsView,
    decorators: [
        (Story) => (
            <div className='max-w-[820px] mx-auto p-4'>
                <Story />
            </div>
        ),
    ],
}
export default meta
type Story = StoryObj<typeof RealityCheckSettingsView>

const noop = () => { /* storybook */ }

export const Disconnected: Story = {
    args: { walletConnected: false, config: undefined, onSave: noop },
}

export const Loading: Story = {
    args: { walletConnected: true, config: undefined, isLoading: true, onSave: noop },
}

export const Default60Min: Story = {
    args: {
        walletConnected: true,
        config: { intervalMinutes: 60, enabled: true },
        onSave: noop,
    },
}

export const Disabled: Story = {
    args: {
        walletConnected: true,
        config: { intervalMinutes: 60, enabled: false },
        onSave: noop,
    },
}

export const Submitting: Story = {
    args: {
        walletConnected: true,
        config: { intervalMinutes: 60, enabled: true },
        submitting: true,
        onSave: noop,
    },
}

export const SaveError: Story = {
    args: {
        walletConnected: true,
        config: { intervalMinutes: 60, enabled: true },
        submitError: 'Network unavailable. Please retry.',
        onSave: noop,
    },
}
