import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TierBreakdown from './TierBreakdown'
import type { TierPolicy } from '@/hooks/contracts/kyc/useActivePolicy'

const UNLIMITED = (1n << 256n) - 1n

// Mirrors the phase-1 testnet ladder: T3 requires the four bits this app
// version has always known (0,1,2,8) plus tax_residency_documented (14).
const TIERS: readonly TierPolicy[] = [
    { requiredGates: 0n, inflowCapEurMinor: 90000n, outflowCapEurMinor: 50000n },
    { requiredGates: 257n, inflowCapEurMinor: 200000n, outflowCapEurMinor: 200000n },
    { requiredGates: 263n, inflowCapEurMinor: 1000000n, outflowCapEurMinor: 1000000n },
    { requiredGates: 16647n, inflowCapEurMinor: 5000000n, outflowCapEurMinor: 3000000n },
    { requiredGates: 18695n, inflowCapEurMinor: UNLIMITED, outflowCapEurMinor: UNLIMITED },
]

function renderBreakdown(overrides: Partial<Parameters<typeof TierBreakdown>[0]> = {}) {
    return render(
        <TierBreakdown
            currentTier='T2'
            gates={undefined}
            onChainGates={263n}
            tiers={TIERS}
            selectedTierIdx={3}
            onSelectedTierChange={vi.fn()}
            onVerify={vi.fn()}
            {...overrides}
        />,
    )
}

describe('<TierBreakdown>', () => {
    it('lists every gate the selected tier requires, including tax residency', () => {
        renderBreakdown()
        expect(screen.getByText('Wallet ownership')).toBeInTheDocument()
        expect(screen.getByText('Identity')).toBeInTheDocument()
        expect(screen.getByText('Address')).toBeInTheDocument()
        expect(screen.getByText('Sanctions screening')).toBeInTheDocument()
        expect(screen.getByText('Tax residency')).toBeInTheDocument()
    })

    it('renders a fallback row for required bits this app version does not recognise', () => {
        const tiers = [
            { requiredGates: 0n, inflowCapEurMinor: 90000n, outflowCapEurMinor: 50000n },
            { requiredGates: (1n << 20n) | 263n, inflowCapEurMinor: UNLIMITED, outflowCapEurMinor: UNLIMITED },
        ] as const
        renderBreakdown({ tiers, selectedTierIdx: 1, currentTier: 'T0' })
        expect(screen.getByText('Additional verification')).toBeInTheDocument()
    })

    it('renders no fallback row when every required bit is known', () => {
        renderBreakdown()
        expect(screen.queryByText('Additional verification')).not.toBeInTheDocument()
    })

    it('includes unknown bits in the needed-for-next-tier checklist', () => {
        renderBreakdown({
            selectedTierIdx: 2,
            nextTier: {
                tier: 'T3',
                missingGates: 1n << 20n,
                inflowCapEurMinor: 50000_00,
                outflowCapEurMinor: 30000_00,
            },
        })
        expect(screen.getByText('Additional verification')).toBeInTheDocument()
    })
})
