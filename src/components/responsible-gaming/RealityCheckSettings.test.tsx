import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { RealityCheckSettingsView } from './RealityCheckSettings'

const noop = () => { /* test */ }

describe('<RealityCheckSettingsView>', () => {
    it('rejects an out-of-range interval with plain copy', () => {
        const onSetInterval = vi.fn()
        render(
            <RealityCheckSettingsView
                walletConnected
                config={{ enabled: true, intervalMinutes: 60 }}
                onSetInterval={onSetInterval}
                onSetEnabled={noop}
            />,
        )
        fireEvent.change(screen.getByLabelText(/remind me every/i), { target: { value: '500' } })
        fireEvent.click(screen.getByRole('button', { name: 'SAVE REMINDER' }))
        expect(screen.getByText('Choose between 15 and 240 minutes.')).toBeInTheDocument()
        expect(onSetInterval).not.toHaveBeenCalled()
    })

    it('saves an in-range interval and labels the toggle by outcome', () => {
        const onSetInterval = vi.fn()
        render(
            <RealityCheckSettingsView
                walletConnected
                config={{ enabled: true, intervalMinutes: 60 }}
                onSetInterval={onSetInterval}
                onSetEnabled={noop}
            />,
        )
        fireEvent.change(screen.getByLabelText(/remind me every/i), { target: { value: '30' } })
        fireEvent.click(screen.getByRole('button', { name: 'SAVE REMINDER' }))
        expect(onSetInterval).toHaveBeenCalledWith(30)
        expect(screen.getByRole('button', { name: 'TURN REMINDER OFF' })).toBeInTheDocument()
    })
})
