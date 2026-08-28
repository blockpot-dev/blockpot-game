import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { _DrawSummaryDialog } from './DrawSummaryDialog'

describe('<_DrawSummaryDialog>', () => {
    it('deep-links the fairness proof with both game and round', async () => {
        renderWithProviders(
            <_DrawSummaryDialog
                open
                onClose={() => undefined}
                onReplayDraw={() => undefined}
                formattedChance='1 in 10'
                formattedDate='1 Jan 2026'
                roundId={{ potIndex: 1, roundIndex: 2, maxRoundsPerPot: 5 }}
                displayDrawnNumberData={[]}
                purchases={[]}
                gameType='quick'
                proofRoundIndex={7}
            />
        )
        const label = await screen.findByText('Fairness proof')
        const link = label.closest('a')
        expect(link).not.toBeNull()
        expect(link).toHaveAttribute('href', expect.stringContaining('game=quick'))
        expect(link).toHaveAttribute('href', expect.stringContaining('round=7'))
    })
})
