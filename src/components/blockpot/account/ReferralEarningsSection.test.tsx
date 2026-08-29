import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReferrerDashboardRecord } from '@/hooks/referral/useReferrerDashboard'

const claim = vi.fn()
const refetch = vi.fn()
const dashboardState: {
    record: ReferrerDashboardRecord | null
    isLoading: boolean
    isError: boolean
    refetch: typeof refetch
    claim: typeof claim
    isClaiming: boolean
} = { record: null, isLoading: false, isError: false, refetch, claim, isClaiming: false }
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
        const button = screen.getByRole('button', { name: /^claim rewards$/i })
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
        expect(screen.getByText(/referral rewards are paused/i)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /contact support/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /claim/i })).toBeDisabled()
    })

    it('disables claim and explains when terminated', () => {
        dashboardState.record = record({ status: 'terminated' })
        render(<ReferralEarningsSection />)
        expect(screen.getByText(/referral rewards have ended/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /claim/i })).toBeDisabled()
    })

    it('renders a loading state while the record is being read', () => {
        dashboardState.record = null
        dashboardState.isLoading = true
        render(<ReferralEarningsSection />)
        expect(screen.getByText(/loading referral rewards/i)).toBeInTheDocument()
        dashboardState.isLoading = false
    })

    it('renders an error state with Retry when the read fails', () => {
        dashboardState.record = null
        dashboardState.isError = true
        render(<ReferralEarningsSection />)
        expect(screen.getByText(/couldn't load your referral rewards/i)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: /^retry$/i }))
        expect(refetch).toHaveBeenCalled()
        dashboardState.isError = false
    })
})
