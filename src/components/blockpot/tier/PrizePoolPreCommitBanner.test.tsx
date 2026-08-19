import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PrizePoolPreCommitBanner from './PrizePoolPreCommitBanner'
import { DirectionalFlow, PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

function makeFlow(over: Partial<DirectionalFlow> = {}): DirectionalFlow {
    return {
        capEurMinor: 500_00,
        usedEurMinor: 0,
        headroomEurMinor: 500_00,
        ratio: 0,
        ...over,
    }
}

function makeState(outflow: Partial<DirectionalFlow> = {}): PlayerActivityState {
    return {
        currentTier: 'T0',
        cumEnteredEurMinor: 0,
        cumWonEurMinor: 0,
        cumClaimsEurMinor: 0,
        largestSingleWinEurMinor: 0,
        inflow: makeFlow({ capEurMinor: 900_00, headroomEurMinor: 900_00 }),
        outflow: makeFlow(outflow),
        nextTier: {
            tier: 'T1',
            missingGates: 1n << 1n,
            inflowCapEurMinor: 2_000_00,
            outflowCapEurMinor: 2_000_00,
        },
        pendingClaimEurMinor: 0,
    }
}

const noop = () => { /* test */ }

describe('<PrizePoolPreCommitBanner>', () => {
    it('surfaces the slice of the prize pool beyond outflow headroom', () => {
        // €5,000 prize pool against €500 of outflow headroom → ≈ €4,500 held.
        render(
            <PrizePoolPreCommitBanner
                state={makeState()}
                context={{ currentPrizePoolEurMinor: 5_000_00, tierRequiredToFullyClaim: 'T2' }}
                onVerify={noop}
            />,
        )

        expect(screen.getByText(/could be worth €5,000/)).toBeInTheDocument()
        expect(screen.getByText(/≈ €4,500 of a prize this size would be held/)).toBeInTheDocument()
    })

    it('renders nothing when the prize pool fits inside outflow headroom', () => {
        const { container } = render(
            <PrizePoolPreCommitBanner
                state={makeState({ capEurMinor: 10_000_00, headroomEurMinor: 10_000_00 })}
                context={{ currentPrizePoolEurMinor: 5_000_00, tierRequiredToFullyClaim: 'T2' }}
                onVerify={noop}
            />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing on the unlimited top tier', () => {
        const { container } = render(
            <PrizePoolPreCommitBanner
                state={makeState({ capEurMinor: null, headroomEurMinor: Number.MAX_SAFE_INTEGER })}
                context={{ currentPrizePoolEurMinor: 125_000_00, tierRequiredToFullyClaim: 'T2' }}
                onVerify={noop}
            />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing without state or context', () => {
        const { container: noState } = render(
            <PrizePoolPreCommitBanner
                state={undefined}
                context={{ currentPrizePoolEurMinor: 5_000_00, tierRequiredToFullyClaim: 'T2' }}
                onVerify={noop}
            />,
        )
        expect(noState).toBeEmptyDOMElement()

        const { container: noContext } = render(
            <PrizePoolPreCommitBanner state={makeState()} context={undefined} onVerify={noop} />,
        )
        expect(noContext).toBeEmptyDOMElement()
    })

    it('fires onVerify from the CTA', () => {
        const onVerify = vi.fn()
        render(
            <PrizePoolPreCommitBanner
                state={makeState()}
                context={{ currentPrizePoolEurMinor: 5_000_00, tierRequiredToFullyClaim: 'T2' }}
                onVerify={onVerify}
            />,
        )

        screen.getByRole('button', { name: /verify now/i }).click()
        expect(onVerify).toHaveBeenCalledOnce()
    })
})
