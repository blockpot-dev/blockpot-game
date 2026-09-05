// BLO-683 Surface 3. The single 90% nudge, once per threshold.
//
// Every render decision comes from one verification-state payload, so these
// tests drive the component by varying that payload. The "at most once" promise
// is a server property (a dismissal row), and the test that matters is that the
// client honours `dismissed` rather than re-deriving anything.
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CapProximityNudge from './CapProximityNudge'
import type { VerificationState } from '@/hooks/player/useVerificationState'

const state = vi.fn<() => { data: VerificationState | undefined }>()
const dismissMutate = vi.fn()

vi.mock('@/hooks/player/useVerificationState', () => ({
    default: () => state(),
    useDismissNudge: () => ({ mutate: dismissMutate, isPending: false }),
}))

function withProximity(over: Partial<NonNullable<VerificationState['capProximity']>> = {}) {
    state.mockReturnValue({
        data: {
            capProximity: {
                ratio: 0.92,
                crossed90Pct: true,
                threshold: 't0_stake_90pct',
                dismissed: false,
                ...over,
            },
            firstVerificationContactAt: null,
        },
    })
}

beforeEach(() => {
    state.mockReset()
    dismissMutate.mockReset()
})

describe('<CapProximityNudge>', () => {
    it('renders once the crossing is reported and not yet dismissed', () => {
        withProximity()
        render(<CapProximityNudge onVerify={vi.fn()} />)
        const nudge = screen.getByTestId('cap-proximity-nudge')
        expect(nudge).toHaveAttribute('data-threshold', 't0_stake_90pct')
        expect(nudge.textContent).toMatch(/identity check/i)
    })

    // The three reasons not to render, each on its own so a regression names
    // which one broke.
    it('renders nothing when there is no cap to be near', () => {
        state.mockReturnValue({ data: { capProximity: null, firstVerificationContactAt: null } })
        render(<CapProximityNudge onVerify={vi.fn()} />)
        expect(screen.queryByTestId('cap-proximity-nudge')).not.toBeInTheDocument()
    })

    it('renders nothing below the crossing', () => {
        withProximity({ ratio: 0.89, crossed90Pct: false })
        render(<CapProximityNudge onVerify={vi.fn()} />)
        expect(screen.queryByTestId('cap-proximity-nudge')).not.toBeInTheDocument()
    })

    // This is the "at most once per threshold" guarantee as the client sees it.
    it('renders nothing once the threshold has been dismissed', () => {
        withProximity({ dismissed: true })
        render(<CapProximityNudge onVerify={vi.fn()} />)
        expect(screen.queryByTestId('cap-proximity-nudge')).not.toBeInTheDocument()
    })

    it('renders nothing while the state is still loading', () => {
        state.mockReturnValue({ data: undefined })
        render(<CapProximityNudge onVerify={vi.fn()} />)
        expect(screen.queryByTestId('cap-proximity-nudge')).not.toBeInTheDocument()
    })

    // Passed back verbatim: the server rejects a key it did not issue, so
    // constructing one client-side is how a nudge becomes undismissable.
    it('dismisses using the threshold key the server issued', async () => {
        const user = userEvent.setup()
        withProximity({ threshold: 't2_claim_90pct' })
        render(<CapProximityNudge onVerify={vi.fn()} />)
        await user.click(screen.getByRole('button', { name: 'DISMISS' }))
        expect(dismissMutate).toHaveBeenCalledWith('t2_claim_90pct')
    })

    it('offers verifying now as the alternative to dismissing', async () => {
        const user = userEvent.setup()
        const onVerify = vi.fn()
        withProximity()
        render(<CapProximityNudge onVerify={onVerify} />)
        await user.click(screen.getByRole('button', { name: 'VERIFY NOW' }))
        expect(onVerify).toHaveBeenCalledTimes(1)
        expect(dismissMutate).not.toHaveBeenCalled()
    })

    it('names no tier, cap, figure or custody vocabulary', () => {
        withProximity()
        render(<CapProximityNudge onVerify={vi.fn()} />)
        const text = within(screen.getByTestId('cap-proximity-nudge')).getByText(/identity check/i).textContent ?? ''
        expect(text.length).toBeGreaterThan(20)
        expect(text).not.toMatch(/tier/i)
        expect(text).not.toMatch(/\bT[0-4]\b/)
        expect(text).not.toMatch(/\bcap\b|allowance|headroom|limit/i)
        expect(text).not.toMatch(/withdraw|deposit/i)
        expect(text).not.toMatch(/\d/)
    })
})
