import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { _DrawSummaryDialog, DrawSummaryLoadingDialog } from './DrawSummaryDialog'

const baseProps = {
    open: true,
    onClose: () => undefined,
    onReplayDraw: () => undefined,
    formattedChance: '1 in 10',
    formattedDate: '1 Jan 2026',
    roundId: { potIndex: 1, roundIndex: 2, maxRoundsPerPot: 5 },
    displayDrawnNumberData: [],
    purchases: [],
    gameType: 'quick' as const,
    proofRoundIndex: 7,
}

describe('<_DrawSummaryDialog>', () => {
    it('deep-links the proof with both game and round', async () => {
        renderWithProviders(<_DrawSummaryDialog {...baseProps} />)
        const label = await screen.findByText('Check the proof')
        const link = label.closest('a')
        expect(link).not.toBeNull()
        expect(link).toHaveAttribute('href', expect.stringContaining('game=quick'))
        expect(link).toHaveAttribute('href', expect.stringContaining('round=7'))
    })

    it('renders an empty state when the player had no entries', async () => {
        renderWithProviders(<_DrawSummaryDialog {...baseProps} />)
        expect(await screen.findByText('You had no entries in this draw.')).toBeInTheDocument()
    })

    it('has no Share button and labels the odds stat consistently', async () => {
        renderWithProviders(<_DrawSummaryDialog {...baseProps} />)
        expect(await screen.findByText('Top prize odds')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('renders a loading state while the draw is fetched', async () => {
        renderWithProviders(<DrawSummaryLoadingDialog open onClose={() => undefined} />)
        expect(await screen.findByText('Loading draw…')).toBeInTheDocument()
    })
})
