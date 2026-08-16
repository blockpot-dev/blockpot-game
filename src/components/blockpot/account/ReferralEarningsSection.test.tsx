import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReferrerDashboardRecord } from '@/hooks/referral/useReferrerDashboard'

const claim = vi.fn()
const dashboardState: {
    record: ReferrerDashboardRecord | null
    claim: typeof claim
    isClaiming: boolean
} = { record: null, claim, isClaiming: false }
vi.mock('@/hooks/referral/useReferrerDashboard', () => ({
    default: () => dashboardState
}))

const { default: ReferralEarningsSection } = await import('./ReferralEarningsSection')

function record(overrides: Partial<ReferrerDashboardRecord> = {}): ReferrerDashboardRecord {
    return {
        status: 'active',
        effectiveShareBps: 1000,
        accrued: 100000000000000000n, // 0.1 ETH
        lifetimeEarned: 300000000000000000n,
        lifetimeClaimed: 200000000000000000n,
        ...overrides
    }
}

describe('ReferralEarningsSection', () => {
    it('renders nothing for wallets that are not registered referrers', () => {
        dashboardState.record = null
        const { container } = render(<ReferralEarningsSection />)
        expect(container).toBeEmptyDOMElement()
    })

    it('shows accrued earnings and an enabled claim for active referrers', () => {
        dashboardState.record = record()
        render(<ReferralEarningsSection />)
        expect(screen.getByText(/0\.1/)).toBeInTheDocument()
        const button = screen.getByRole('button', { name: /claim/i })
        expect(button).toBeEnabled()
        fireEvent.click(button)
        expect(claim).toHaveBeenCalled()
    })

    it('disables claim with a zero balance', () => {
        dashboardState.record = record({ accrued: 0n })
        render(<ReferralEarningsSection />)
        expect(screen.getByRole('button', { name: /claim/i })).toBeDisabled()
    })

    it('disables claim and explains when suspended', () => {
        dashboardState.record = record({ status: 'suspended' })
        render(<ReferralEarningsSection />)
        expect(screen.getByText(/suspended/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /claim/i })).toBeDisabled()
    })

    it('disables claim and explains when terminated', () => {
        dashboardState.record = record({ status: 'terminated' })
        render(<ReferralEarningsSection />)
        expect(screen.getByText(/terminated/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /claim/i })).toBeDisabled()
    })
})
