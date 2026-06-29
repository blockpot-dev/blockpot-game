import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { _PrizesOverviewDialog } from './PrizesOverviewDialog'
import type { FiatConverter } from '@/hooks/utilities/useFiatConverter'

// _PrizesOverviewDialog takes `pots` and `fiatConverter` as plain props, so we
// can render it directly without the wagmi / Web3 provider stack. The fiat
// converter is stubbed to a deterministic formatter.
const fiatConverter: FiatConverter = (value: bigint) => ({
    value: 0n,
    formattedValue: value === 0n ? '$0' : '$1',
})

describe('<PrizesOverviewDialog>', () => {
    it('renders a row per pot at 0 ETH / $0 when there are no entries (all pots zero)', async () => {
        // No entries → every pot is 0n and the total prize pool is 0. Each pot
        // should still surface as a row so players see the prize structure.
        const pots = [0n, 0n, 0n, 0n, 0n] as const

        renderWithProviders(<_PrizesOverviewDialog open onClose={vi.fn()} pots={pots} fiatConverter={fiatConverter} />)

        // The dialog content portals in after a transition tick — await it.
        const ethCells = await screen.findAllByText('0 ETH')
        expect(ethCells).toHaveLength(pots.length)
        expect(screen.getAllByText('0%')).toHaveLength(pots.length)
        expect(screen.getByText('Jackpot')).toBeInTheDocument()
    })

    it('renders rows with derived percentages when pots are funded', async () => {
        const pots = [3n * 10n ** 18n, 1n * 10n ** 18n] as const // 75% / 25%

        renderWithProviders(<_PrizesOverviewDialog open onClose={vi.fn()} pots={pots} fiatConverter={fiatConverter} />)

        expect(await screen.findByText('75%')).toBeInTheDocument()
        expect(screen.getByText('25%')).toBeInTheDocument()
    })
})
