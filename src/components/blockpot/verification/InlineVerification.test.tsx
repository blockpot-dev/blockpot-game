// BLO-683 Surface 1. Verification comes to the blocked action, not the other
// way round: one sentence saying what is paused, the Sumsub flow embedded in
// place, and the paused action resuming on its own when the player finishes.
//
// The assertions that matter are the negative ones. This surface is the main
// place a tier name or a cap could leak back into player copy, and the silent
// tier design is only as good as the copy that survives review.
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InlineVerification, { type VerificationSurfaceReason } from './InlineVerification'

// Plain render, not renderWithProviders: both hooks this component touches are
// mocked below, so it needs no QueryClient and no router. renderWithProviders
// mounts through a TanStack router, which resolves asynchronously — using it
// here would mean every assertion had to be awaited for no benefit.

function renderSurface(props: Parameters<typeof InlineVerification>[0]) {
    render(<InlineVerification {...props} />)
    return screen.getByTestId('inline-verification')
}

const stampContact = vi.fn()
vi.mock('@/hooks/player/useVerificationState', () => ({
    useRecordVerificationContact: () => ({ mutate: stampContact }),
}))

// The real host lazy-loads the Sumsub bundle and talks to the network. Stand in
// a button that invokes onComplete, so "the paused action resumes" is testable
// without the SDK.
vi.mock('@/components/kyc/SumsubSdkHost', () => ({
    default: ({ onComplete }: { onComplete?: () => void }) => (
        <button type='button' onClick={() => onComplete?.()}>
            finish-verification
        </button>
    ),
}))

const reasons: VerificationSurfaceReason[] = [
    { kind: 'claim_over_headroom', requiredEurMinor: 120_000 },
    { kind: 'claim_new_wallet' },
    { kind: 'stake_would_cross_cap', capEurMinor: 90_000 },
]

beforeEach(() => {
    stampContact.mockClear()
})

describe('<InlineVerification>', () => {
    it.each(reasons)('renders a reason sentence for $kind', (reason) => {
        const panel = renderSurface({ reason, onResume: vi.fn() })
        expect(panel).toHaveAttribute('data-reason', reason.kind)
        expect(panel.textContent).toMatch(/identity check/i)
    })

    it('names the amount on a claim over headroom', () => {
        const panel = renderSurface({
            reason: { kind: 'claim_over_headroom', requiredEurMinor: 120_000 },
            onResume: vi.fn(),
        })
        expect(panel.textContent).toContain('€1,200')
    })

    it('names the remaining allowance on a stake that would cross a cap', () => {
        const panel = renderSurface({
            reason: { kind: 'stake_would_cross_cap', capEurMinor: 90_000 },
            onResume: vi.fn(),
        })
        expect(panel.textContent).toContain('€900')
    })

    // The promise of this surface: the thing you were doing carries on.
    it('resumes the paused action when verification completes', async () => {
        const user = userEvent.setup()
        const onResume = vi.fn()
        const panel = renderSurface({ reason: { kind: 'claim_new_wallet' }, onResume })
        await user.click(within(panel).getByRole('button', { name: 'finish-verification' }))
        expect(onResume).toHaveBeenCalledTimes(1)
    })

    // Stamped on open, not on completion: Surface 4 exists to help the player
    // who started and walked away, and that player never reaches completion.
    it('stamps first verification contact when the surface opens', () => {
        renderSurface({ reason: { kind: 'claim_new_wallet' }, onResume: vi.fn() })
        expect(stampContact).toHaveBeenCalledTimes(1)
    })

    it.each(reasons)('leaks no tier name, cap, or custody vocabulary for $kind', (reason) => {
        const panel = renderSurface({ reason, onResume: vi.fn() })
        const text = panel.textContent ?? ''
        // Guard against a vacuous pass: absence assertions on an empty string
        // are always true, which is exactly how a copy check quietly stops
        // checking anything.
        expect(text.length).toBeGreaterThan(20)
        expect(text).not.toMatch(/tier/i)
        expect(text).not.toMatch(/\bT[0-4]\b/)
        expect(text).not.toMatch(/withdraw/i)
        expect(text).not.toMatch(/deposit/i)
        expect(text).not.toMatch(/\blimit\b/i)
    })

    it('offers a way out only when the caller provides one', async () => {
        const user = userEvent.setup()
        const onCancel = vi.fn()
        const { unmount } = render(
            <InlineVerification reason={{ kind: 'claim_new_wallet' }} onResume={vi.fn()} onCancel={onCancel} />,
        )
        await user.click(screen.getByRole('button', { name: 'NOT NOW' }))
        expect(onCancel).toHaveBeenCalledTimes(1)
        unmount()

        render(<InlineVerification reason={{ kind: 'claim_new_wallet' }} onResume={vi.fn()} />)
        expect(screen.queryByRole('button', { name: 'NOT NOW' })).not.toBeInTheDocument()
    })
})
