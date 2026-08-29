// BLO-758: /how-to-play is proof-first, uses approved vocabulary only, links
// to /transparency, and renders its fee figures from the live entry quote
// rather than hardcoded strings.
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { PEA_PER_ENTRY_WEI } from '@/constants/protocol'
import { HowToPlayPage } from './how-to-play'

// Distinctive figures so the assertions cannot pass on protocol.ts fallbacks:
// CF 2.5% and OF 7.5% of PEA.
vi.mock('@/hooks/contracts/operator/useEntryQuote', () => ({
    default: vi.fn(() => {
        const pea = PEA_PER_ENTRY_WEI
        const cf = pea * 250n / 10_000n
        const opFee = pea * 750n / 10_000n
        return {
            quote: { total: pea + cf + opFee, pea, cf, opFee },
            isLoading: false,
            isPlaceholderData: false,
        }
    }),
}))

const BANNED = /licensed|gambling|Tier \d|winnings|ticket/i

describe('/how-to-play', () => {
    it('uses approved vocabulary only', async () => {
        const { container } = renderWithProviders(<HowToPlayPage />)
        await screen.findByRole('heading', { level: 1, name: /how to play/i })
        expect(container.textContent).not.toMatch(BANNED)
    })

    it('links to /transparency', async () => {
        renderWithProviders(<HowToPlayPage />)
        const links = await screen.findAllByRole('link', { name: /see the proof|check any draw/i })
        expect(links.length).toBeGreaterThan(0)
        for (const link of links) expect(link).toHaveAttribute('href', '/transparency')
    })

    it('renders the fee figures from the entry quote', async () => {
        renderWithProviders(<HowToPlayPage />)
        expect(await screen.findByText(/0\.001 ETH/)).toBeInTheDocument()
        expect(screen.getByText(/2\.5%/)).toBeInTheDocument()
        expect(screen.getByText(/7\.5%/)).toBeInTheDocument()
    })
})
