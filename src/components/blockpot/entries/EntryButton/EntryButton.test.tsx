import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import EntryButton from './EntryButton'

// BLO-748: the primary CTA uses the approved entry vocabulary — never
// PURCHASE / PURCHASING / Purchased.
describe('EntryButton', () => {
    it('renders ENTER DRAW when idle', () => {
        render(<EntryButton enter={() => {}} status='idle' canEnter />)
        expect(screen.getByRole('button')).toHaveTextContent('ENTER DRAW')
    })

    it('renders ENTERING… while the transaction is pending', () => {
        render(<EntryButton enter={() => {}} status='pending' canEnter />)
        expect(screen.getByRole('button')).toHaveTextContent('ENTERING…')
    })

    it('renders ENTERED after a pending → success transition', () => {
        const { rerender } = render(<EntryButton enter={() => {}} status='pending' canEnter />)
        rerender(<EntryButton enter={() => {}} status='success' canEnter />)
        expect(screen.getByRole('button')).toHaveTextContent('ENTERED')
    })

    it('never renders purchase vocabulary', () => {
        const { container, rerender } = render(<EntryButton enter={() => {}} status='idle' canEnter />)
        expect(container.textContent).not.toMatch(/purchas/i)
        rerender(<EntryButton enter={() => {}} status='pending' canEnter />)
        expect(container.textContent).not.toMatch(/purchas/i)
    })

    it('labels registration mode REGISTER TO ENTER and CONFIRM IN WALLET…', () => {
        const registration = { register: () => {}, isSigning: false, isPending: false, isFailed: false, disabled: false }
        const { rerender } = render(<EntryButton enter={() => {}} status='idle' canEnter registration={registration} />)
        expect(screen.getByRole('button')).toHaveTextContent('REGISTER TO ENTER')
        rerender(<EntryButton enter={() => {}} status='idle' canEnter registration={{ ...registration, isSigning: true }} />)
        expect(screen.getByRole('button')).toHaveTextContent('CONFIRM IN WALLET…')
    })
})

// BLO-752: a disabled CTA shows its reason as visible text, not only as a
// hover `title`.
describe('EntryButton disabled reasons', () => {
    it('renders the disabled reason as visible text under the button', () => {
        render(<EntryButton enter={() => {}} status='idle' canEnter={false} disabledReason='Entries are not open yet. Check back soon.' />)
        expect(screen.getByRole('button')).toBeDisabled()
        expect(screen.getByText('Entries are not open yet. Check back soon.')).toBeVisible()
    })

    it('renders a registration disabled reason as visible text', () => {
        const registration = { register: () => {}, isSigning: false, isPending: false, isFailed: false, disabled: true, disabledReason: 'Registration is unavailable right now.' }
        render(<EntryButton enter={() => {}} status='idle' canEnter registration={registration} />)
        expect(screen.getByText('Registration is unavailable right now.')).toBeVisible()
    })

    it('labels a failed registration RETRY REGISTRATION with the reason inline', () => {
        const registration = { register: () => {}, isSigning: false, isPending: false, isFailed: true, disabled: false, disabledReason: 'Registration didn\'t complete. Check your wallet and try again.' }
        render(<EntryButton enter={() => {}} status='idle' canEnter registration={registration} />)
        expect(screen.getByRole('button')).toHaveTextContent('RETRY REGISTRATION')
        expect(screen.getByText(/Registration didn't complete/)).toBeVisible()
    })
})
