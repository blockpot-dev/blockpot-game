import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ZERO_ADDRESS } from '@/web3/constants'
import { BlockpotDraw } from '@/providers/BlockpotDrawProvider'
import { DrawRound } from '@/types/draw'

vi.mock('@/providers/SelectedGameProvider', () => ({
    useSelectedGame: () => ({ selectedGame: 'main' })
}))

const { default: RoundDraw } = await import('.')

const ROUND: DrawRound = {
    roundIndex: 1,
    roundIndexInPot: 0,
    maxRoundsInPot: 10,
    prizePool: 0n,
    draws: [{ number: 1, winner: ZERO_ADDRESS, prize: 0n }],
    entryCount: 1,
    potIndex: 1,
    drawTime: 0,
    chance: 100,
    done: true
}

const roundInfo = { potIndex: 1, currentRound: 1, maximumRounds: 10, winnerChance: 100, prizePool: 0n }

function renderStage(draw: BlockpotDraw, onSeeResults = vi.fn()) {
    render(<RoundDraw draw={draw} accountAddress={ZERO_ADDRESS} roundInfo={roundInfo} onSeeResults={onSeeResults} />)
    return onSeeResults
}

describe('<RoundDraw>', () => {
    it('renders the waiting copy while randomness is verified', () => {
        renderStage({ roundIndex: 1, drawStage: { type: 'waiting', roundIndex: 1 } })
        expect(screen.getByText('Preparing the draw…')).toBeInTheDocument()
        expect(screen.getByText(/Chainlink VRF is being verified/)).toBeInTheDocument()
    })

    it('renders "First number coming up…" before the first number lands', () => {
        renderStage({
            roundIndex: 1,
            drawStage: { type: 'drawing', drawnRound: ROUND, stagedDraw: { drawnNumbers: [] }, playerEntries: [] }
        })
        expect(screen.getByText('First number coming up…')).toBeInTheDocument()
    })

    it('renders "Draw complete" with a See results button on the complete stage', () => {
        const onSeeResults = renderStage({
            roundIndex: 1,
            drawStage: { type: 'complete', drawnRound: ROUND, stagedDraw: { drawnNumbers: [] }, playerEntries: [] }
        })
        expect(screen.getByText(/Draw complete/)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'See results' }))
        expect(onSeeResults).toHaveBeenCalledTimes(1)
    })
})
