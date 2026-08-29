import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TierBreakdown from './TierBreakdown'

const LADDER_COPY = /Tier \d|T[0-4]\b|allowance|cap\b|headroom|limit €|Achieved|Locked|Entry in|Claim out/

function renderBreakdown(overrides: Partial<Parameters<typeof TierBreakdown>[0]> = {}) {
    return render(
        <TierBreakdown
            gates={undefined}
            onChainGates={263n}
            nextTier={{
                tier: 'T3',
                missingGates: (1n << 4n) | (1n << 14n),
                inflowCapEurMinor: 50000_00,
                outflowCapEurMinor: 30000_00,
            }}
            onVerify={vi.fn()}
            {...overrides}
        />,
    )
}

describe('<TierBreakdown>', () => {
    it('lists only the gates still missing for the next step', () => {
        renderBreakdown()
        expect(screen.getByText('Source of funds')).toBeInTheDocument()
        expect(screen.getByText('Tax residency')).toBeInTheDocument()
        // Already-passed gates (bits 0,1,2,8) are not part of the checklist.
        expect(screen.queryByText('Identity')).not.toBeInTheDocument()
        expect(screen.queryByText('Sanctions screening')).not.toBeInTheDocument()
    })

    it('renders a fallback row for required bits this app version does not recognise', () => {
        renderBreakdown({
            nextTier: { tier: 'T3', missingGates: 1n << 20n, inflowCapEurMinor: null, outflowCapEurMinor: null },
        })
        expect(screen.getByText('Additional verification')).toBeInTheDocument()
    })

    it('renders no fallback row when every missing bit is known', () => {
        renderBreakdown()
        expect(screen.queryByText('Additional verification')).not.toBeInTheDocument()
    })

    it('shows "No verification required." with one CTA-less card when nothing is missing', () => {
        renderBreakdown({ nextTier: null })
        expect(screen.getByText('No verification required.')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /verify now/i })).not.toBeInTheDocument()
    })

    it('exposes one Verify now button and never names a tier, cap or headroom', () => {
        const onVerify = vi.fn()
        const { container } = renderBreakdown({ onVerify })
        expect(container.textContent).not.toMatch(LADDER_COPY)
        expect(screen.queryByRole('tab')).not.toBeInTheDocument()
        const buttons = screen.getAllByRole('button', { name: /verify now/i })
        expect(buttons).toHaveLength(1)
        buttons[0].click()
        expect(onVerify).toHaveBeenCalledOnce()
    })
})
