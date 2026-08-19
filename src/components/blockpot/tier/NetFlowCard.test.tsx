import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import NetFlowCard from './NetFlowCard'
import { DirectionalFlow, PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

function flow(used: number, cap: number | null): DirectionalFlow {
    if (cap === null) {
        return { capEurMinor: null, usedEurMinor: used, headroomEurMinor: Number.MAX_SAFE_INTEGER, ratio: 0 }
    }
    return {
        capEurMinor: cap,
        usedEurMinor: used,
        headroomEurMinor: Math.max(0, cap - used),
        ratio: cap > 0 ? Math.min(used / cap, 1) : 1,
    }
}

type NetStateOptions = {
    entered?: number
    claimed?: number
    inflowCap?: number | null
    outflowCap?: number | null
    tier?: PlayerActivityState['currentTier']
}

// Keeps the cum counters and the per-direction flows coherent the way
// usePlayerActivityState derives them from the chain snapshot.
function netState(options: NetStateOptions = {}): PlayerActivityState {
    const {
        entered = 0,
        claimed = 0,
        inflowCap = 10_000_00,
        outflowCap = 10_000_00,
        tier = 'T2',
    } = options
    return {
        currentTier: tier,
        cumWageredEurMinor: entered,
        cumWonEurMinor: claimed,
        cumClaimsEurMinor: claimed,
        largestSingleWinEurMinor: 0,
        inflow: flow(entered, inflowCap),
        outflow: flow(claimed, outflowCap),
        nextTier: null,
        pendingClaimEurMinor: 0,
    }
}

function hero(container: HTMLElement): Element | null {
    return container.querySelector('[data-slot="net-flow-hero"]')
}

function warning(container: HTMLElement): Element | null {
    return container.querySelector('[data-slot="net-flow-warning"]')
}

describe('<NetFlowCard>', () => {
    it('renders nothing when state is undefined', () => {
        const { container } = render(<NetFlowCard state={undefined} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('shows the entered direction when net is positive', () => {
        const { container } = render(
            <NetFlowCard state={netState({ entered: 415_00, claimed: 100_00 })} />,
        )

        expect(screen.getByRole('group', { name: /net flow/i })).toBeInTheDocument()
        expect(screen.getByText(/entered so far/i)).toBeInTheDocument()
        expect(hero(container)).toHaveTextContent('€315')
        expect(hero(container)).toHaveAttribute('data-zone', 'ok')
        expect(screen.getByText('counts toward your €10,000 entry limit')).toBeInTheDocument()
        expect(warning(container)).toBeNull()
    })

    it('shows the claimed direction when net is negative', () => {
        const { container } = render(
            <NetFlowCard state={netState({ entered: 100_00, claimed: 415_00 })} />,
        )

        expect(screen.getByText(/claimed so far/i)).toBeInTheDocument()
        expect(hero(container)).toHaveTextContent('€315')
        expect(screen.getByText('counts toward your €10,000 claim limit')).toBeInTheDocument()
    })

    it('shows all square when entries and claims balance out', () => {
        const { container } = render(
            <NetFlowCard state={netState({ entered: 200_00, claimed: 200_00 })} />,
        )

        expect(screen.getByText(/all square/i)).toBeInTheDocument()
        expect(hero(container)).toHaveTextContent('€0')
        expect(hero(container)).toHaveAttribute('data-zone', 'ok')
        expect(screen.getByText('Entries and claims are balanced')).toBeInTheDocument()
        expect(warning(container)).toBeNull()
    })

    it('enters the warn zone at exactly 80% of the active cap', () => {
        const { container } = render(
            <NetFlowCard state={netState({ entered: 800_00, inflowCap: 1_000_00 })} />,
        )

        expect(hero(container)).toHaveAttribute('data-zone', 'warn')
        expect(warning(container)).toHaveTextContent('€200 left before entries pause')
    })

    it('stays in the ok zone just below 80% of the active cap', () => {
        const { container } = render(
            <NetFlowCard state={netState({ entered: 790_00, inflowCap: 1_000_00 })} />,
        )

        expect(hero(container)).toHaveAttribute('data-zone', 'ok')
        expect(warning(container)).toBeNull()
    })

    it('enters the block zone at 95% of the active cap', () => {
        const { container } = render(
            <NetFlowCard state={netState({ entered: 950_00, inflowCap: 1_000_00 })} />,
        )

        expect(hero(container)).toHaveAttribute('data-zone', 'block')
        expect(warning(container)).toHaveTextContent('€50 left before entries pause')
    })

    it('words the warning around claims when the outflow cap is active', () => {
        const { container } = render(
            <NetFlowCard state={netState({ claimed: 800_00, outflowCap: 1_000_00 })} />,
        )

        expect(hero(container)).toHaveAttribute('data-zone', 'warn')
        expect(warning(container)).toHaveTextContent('€200 left before claims pause')
    })

    it('stays neutral with an unlimited active cap', () => {
        const { container } = render(
            <NetFlowCard
                state={netState({
                    entered: 120_000_00, inflowCap: null, outflowCap: null, tier: 'T4',
                })}
            />,
        )

        expect(hero(container)).toHaveAttribute('data-zone', 'ok')
        expect(screen.getByText('No entry limit at T4')).toBeInTheDocument()
        expect(warning(container)).toBeNull()
        expect(screen.getByText('Entry limit Unlimited · Claim limit Unlimited')).toBeInTheDocument()
    })

    it('always lists both caps in the footer', () => {
        render(<NetFlowCard state={netState({ entered: 315_00 })} />)

        expect(screen.getByText('Entry limit €10,000 · Claim limit €10,000')).toBeInTheDocument()
    })

    it('blocks immediately when the active cap is zero', () => {
        const { container } = render(
            <NetFlowCard state={netState({ entered: 100_00, inflowCap: 0 })} />,
        )

        expect(hero(container)).toHaveAttribute('data-zone', 'block')
        expect(warning(container)).toHaveTextContent('€0 left before entries pause')
    })

    it('shows the true net even when it exceeds the active cap', () => {
        const { container } = render(
            <NetFlowCard state={netState({ entered: 1_200_00, inflowCap: 1_000_00 })} />,
        )

        expect(hero(container)).toHaveTextContent('€1,200')
        expect(hero(container)).toHaveAttribute('data-zone', 'block')
        expect(warning(container)).toHaveTextContent('€0 left before entries pause')
    })

    it('renders the current tier badge', () => {
        render(<NetFlowCard state={netState({ entered: 315_00 })} />)

        expect(screen.getByRole('status', { name: /tier 2/i })).toBeInTheDocument()
    })
})
