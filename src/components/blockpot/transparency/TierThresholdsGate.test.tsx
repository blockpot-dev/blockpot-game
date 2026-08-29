import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TierThresholdsGate, { _TierThresholdsGate } from './TierThresholdsGate'

vi.mock('@/hooks/utilities/useAccountAddress', () => ({ default: () => '0x1000000000000000000000000000000000000001' }))
const useKycTier = vi.fn()
vi.mock('@/hooks/contracts/kyc-registry/useKycTier', () => ({ default: (a: string) => useKycTier(a) }))
vi.mock('./TierThresholds', () => ({ default: () => <div data-testid='tier-table' /> }))

describe('TierThresholdsGate', () => {
    it.each([0, 1, 3])('pure gate renders children only from Tier 1 (tier=%i)', (tier) => {
        const { unmount } = render(<_TierThresholdsGate tier={tier}><span>table</span></_TierThresholdsGate>)
        expect(screen.queryByText('table') !== null).toBe(tier >= 1)
        unmount()
    })

    it('hides the table for a Tier 0 or disconnected wallet', () => {
        useKycTier.mockReturnValue({ tier: 0, isLoading: false })
        render(<TierThresholdsGate />)
        expect(screen.queryByTestId('tier-table')).toBeNull()
    })

    it('shows the table once the on-chain tier is 1 or above', () => {
        useKycTier.mockReturnValue({ tier: 1, isLoading: false })
        render(<TierThresholdsGate />)
        expect(screen.getByTestId('tier-table')).toBeInTheDocument()
    })
})
