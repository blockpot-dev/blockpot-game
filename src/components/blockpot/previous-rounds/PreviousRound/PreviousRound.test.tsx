import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Address } from 'viem'
import { _PreviousRound } from './PreviousRound'
import { ZERO_ADDRESS } from '@/web3/constants'
import type { DrawRound, DrawnNumber } from '@/types/draw'

vi.mock('@/utilities/time/format-date', () => ({
    formatDateWithTime: () => 'mocked date',
}))

const WINNER_A: Address = '0x1111111111111111111111111111111111111111'
const WINNER_B: Address = '0x2222222222222222222222222222222222222222'

function makeDraw(winner: Address, ordinal: number): DrawnNumber {
    return {
        winner,
        number: 1000 + ordinal,
        prize: 0n,
    }
}

function makeRound(draws: DrawnNumber[]): DrawRound {
    return {
        roundIndex: 0,
        draws,
        prizePool: 0n,
        drawTime: 0,
        entryCount: 0,
        potIndex: 0,
        roundIndexInPot: 0,
        chance: 10000,
        done: true,
        maxRoundsInPot: 1,
    }
}

describe('<_PreviousRound> badge', () => {
    it('disconnected viewer never sees "Your prize" when no draw has a winner', () => {
        const round = makeRound([
            makeDraw(ZERO_ADDRESS, 1),
            makeDraw(ZERO_ADDRESS, 2),
            makeDraw(ZERO_ADDRESS, 3),
        ])
        render(
            <_PreviousRound
                round={round}
                accountAddress={ZERO_ADDRESS}
                gameType='main'
                viewRoundSummary={vi.fn()}
            />,
        )
        expect(screen.queryByText('Your prize')).not.toBeInTheDocument()
    })

    it('disconnected viewer sees "Top prize paid" when draws[0] has a real winner', () => {
        const round = makeRound([
            makeDraw(WINNER_A, 1),
            makeDraw(ZERO_ADDRESS, 2),
            makeDraw(ZERO_ADDRESS, 3),
        ])
        render(
            <_PreviousRound
                round={round}
                accountAddress={ZERO_ADDRESS}
                gameType='main'
                viewRoundSummary={vi.fn()}
            />,
        )
        expect(screen.getByText('Top prize paid')).toBeInTheDocument()
        expect(screen.queryByText('Your prize')).not.toBeInTheDocument()
    })

    it('connected viewer who actually won sees "Your prize" with the right ordinal', () => {
        const round = makeRound([
            makeDraw(WINNER_A, 1),
            makeDraw(WINNER_B, 2),
            makeDraw(ZERO_ADDRESS, 3),
        ])
        const { container } = render(
            <_PreviousRound
                round={round}
                accountAddress={WINNER_B}
                gameType='main'
                viewRoundSummary={vi.fn()}
            />,
        )
        expect(screen.getByText('Your prize')).toBeInTheDocument()
        expect(container.querySelector('[data-ordinal="2"]')).not.toBeNull()
    })

    it('connected viewer who won renders the badge with data-filled="true"', () => {
        const round = makeRound([
            makeDraw(WINNER_A, 1),
            makeDraw(WINNER_B, 2),
            makeDraw(ZERO_ADDRESS, 3),
        ])
        const { container } = render(
            <_PreviousRound
                round={round}
                accountAddress={WINNER_B}
                gameType='main'
                viewRoundSummary={vi.fn()}
            />,
        )
        expect(container.querySelector('[data-ordinal="2"][data-filled="true"]')).not.toBeNull()
    })

    it('disconnected viewer or non-winning round leaves the badge unfilled', () => {
        const topPrizeByOther = makeRound([
            makeDraw(WINNER_A, 1),
            makeDraw(ZERO_ADDRESS, 2),
            makeDraw(ZERO_ADDRESS, 3),
        ])
        const { container: disconnectedContainer } = render(
            <_PreviousRound
                round={topPrizeByOther}
                accountAddress={ZERO_ADDRESS}
                gameType='main'
                viewRoundSummary={vi.fn()}
            />,
        )
        expect(disconnectedContainer.querySelector('[data-ordinal="1"]')).not.toBeNull()
        expect(disconnectedContainer.querySelector('[data-filled]')).toBeNull()

        const { container: nonWinningContainer } = render(
            <_PreviousRound
                round={topPrizeByOther}
                accountAddress={WINNER_B}
                gameType='main'
                viewRoundSummary={vi.fn()}
            />,
        )
        expect(nonWinningContainer.querySelector('[data-ordinal="1"]')).not.toBeNull()
        expect(nonWinningContainer.querySelector('[data-filled]')).toBeNull()
    })
})
