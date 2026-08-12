import { useState } from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { RealityCheckSettingsView } from './RealityCheckSettings'
import { RealityCheckConfig } from '@/hooks/responsible-gaming/useRealityCheck'

const meta: Meta<typeof RealityCheckSettingsView> = {
    component: RealityCheckSettingsView,
}
export default meta
type Story = StoryObj<typeof RealityCheckSettingsView>

function Interactive({ initial }: { initial: RealityCheckConfig }) {
    const [config, setConfig] = useState(initial)
    return (
        <RealityCheckSettingsView
            walletConnected
            config={config}
            onSetInterval={(m) => setConfig((c) => ({ ...c, intervalMinutes: m }))}
            onSetEnabled={(enabled) => setConfig((c) => ({ ...c, enabled }))}
        />
    )
}

export const Enabled: Story = {
    render: () => <Interactive initial={{ intervalMinutes: 60, enabled: true }} />,
}

export const Disabled: Story = {
    render: () => <Interactive initial={{ intervalMinutes: 60, enabled: false }} />,
}

export const Disconnected: Story = {
    args: {
        walletConnected: false,
        config: { intervalMinutes: 60, enabled: true },
        onSetInterval: () => {},
        onSetEnabled: () => {},
    },
}
