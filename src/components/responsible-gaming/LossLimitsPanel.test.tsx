import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LossLimitsPanelView } from './LossLimitsPanel'
import { formatEffectiveAt } from './lossLimitCopy'
import { LossLimitsState } from '@/hooks/responsible-gaming/useLossLimits'

const noop = () => { /* test */ }
const NOW = new Date('2026-08-29T10:00:00.000Z')

const configured: LossLimitsState = {
    daily: { amountEurMinor: 10_000, effectiveFrom: '2026-08-01T00:00:00.000Z' },
    pending: [],
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

describe('<LossLimitsPanelView>', () => {
    beforeEach(() => {
        vi.spyOn(Date, 'now').mockReturnValue(NOW.getTime())
    })
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('shows the computed effective date and the cancel path before an increase is submitted', async () => {
        renderWithProviders(
            <LossLimitsPanelView walletConnected state={configured} onSet={noop} onCancelPending={noop} />,
        )
        const input = (await screen.findAllByPlaceholderText('e.g. 100.00'))[0]
        fireEvent.change(input, { target: { value: '200' } })
        const effective = formatEffectiveAt(new Date(NOW.getTime() + 24 * 60 * 60 * 1000).toISOString())
        expect(screen.getByText(new RegExp(`takes effect ${escape(effective)}`))).toBeInTheDocument()
        expect(screen.getByText(/You can cancel before then\./)).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: 'SAVE LIMIT' }).length).toBeGreaterThan(0)
    })

    it('renders retry copy when the limits query fails', async () => {
        const onRetry = vi.fn()
        renderWithProviders(
            <LossLimitsPanelView
                walletConnected
                state={undefined}
                queryError
                onRetry={onRetry}
                onSet={noop}
                onCancelPending={noop}
            />,
        )
        expect(await screen.findByText(/We couldn't load your loss limits/)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'TRY AGAIN' }))
        expect(onRetry).toHaveBeenCalled()
    })

    it('names pending increases with their effective date and a cancel-increase action', async () => {
        const effectiveAt = '2026-08-30T10:00:00.000Z'
        renderWithProviders(
            <LossLimitsPanelView
                walletConnected
                state={{
                    ...configured,
                    pending: [{ id: 'p1', period: 'daily', newAmountEurMinor: 20_000, direction: 'increase', effectiveAt }],
                }}
                successMessage='Daily limit saved.'
                onSet={noop}
                onCancelPending={noop}
            />,
        )
        expect(await screen.findByText(new RegExp(`Daily limit: increase to €200 · takes effect ${escape(formatEffectiveAt(effectiveAt))}`))).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'CANCEL INCREASE' })).toBeInTheDocument()
        expect(screen.getByRole('status')).toHaveTextContent('Daily limit saved.')
    })
})
