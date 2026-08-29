import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { SelfExclusionBannerView } from './SelfExclusionBanner'
import { SelfExclusionRecord } from '@/hooks/responsible-gaming/useSelfExclusion'

const record = (overrides: Partial<SelfExclusionRecord> = {}): SelfExclusionRecord => ({
    id: 'fixture',
    duration: '7d',
    startsAt: '2026-08-29T00:00:00.000Z',
    endsAt: '2026-09-05T00:00:00.000Z',
    appliedBy: 'player',
    ...overrides,
})

describe('<SelfExclusionBannerView>', () => {
    it('renders nothing without an active record', () => {
        const { container } = renderWithProviders(
            <SelfExclusionBannerView record={null} hasClaimableWinnings={false} />,
        )
        expect(container.querySelector('[role="alert"]')).toBeNull()
    })

    it('always reassures about claims, even with nothing claimable', async () => {
        renderWithProviders(
            <SelfExclusionBannerView record={record()} hasClaimableWinnings={false} />,
        )
        expect(await screen.findByRole('alert')).toHaveTextContent(/you can still claim prizes/i)
    })

    it('links to the responsible gaming page', async () => {
        renderWithProviders(
            <SelfExclusionBannerView record={record({ duration: 'permanent', endsAt: null })} hasClaimableWinnings />,
        )
        const link = await screen.findByRole('link', { name: /manage your settings/i })
        expect(link).toHaveAttribute('href', '/responsible-gaming')
        expect(screen.getByRole('alert')).toHaveTextContent(/you can still claim prizes/i)
    })
})
