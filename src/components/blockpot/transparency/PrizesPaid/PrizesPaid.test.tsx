import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Address } from 'viem'
import { _PrizesPaid } from './PrizesPaid'
import { DrawnNumber } from '@/types/draw'
import { ZERO_ADDRESS } from '@/web3/constants'

const ALICE = '0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657' as Address
const BOB = '0x1111111111111111111111111111111111111111' as Address

function draw(winner: Address, number: number, prize: bigint): DrawnNumber {
    return { winner, number, prize }
}

// chainId 1 has a block explorer configured, so the explorer links render.
const CHAIN_ID = 1

describe('<_PrizesPaid>', () => {
    it('renders a row per paid prize with a truncated recipient', () => {
        render(
            <_PrizesPaid
                draws={[draw(ALICE, 7, 1_000_000_000_000_000_000n), draw(BOB, 12, 250_000_000_000_000_000n)]}
                roundIndex={4}
                chainId={CHAIN_ID}
            />
        )

        expect(screen.getByTestId('prize-row-1')).toBeInTheDocument()
        expect(screen.getByTestId('prize-row-2')).toBeInTheDocument()
        expect(screen.getByTestId('prize-amount-1')).toHaveTextContent('1 ETH')
        expect(screen.getByTestId('prize-amount-2')).toHaveTextContent('0.25 ETH')
        expect(screen.getByTestId('prize-recipient-1')).toHaveTextContent('0x73AB…B657')
        expect(screen.getByTestId('prize-recipient-2')).toHaveTextContent('0x1111…1111')
    })

    it('never renders a full recipient address', () => {
        render(
            <_PrizesPaid
                draws={[draw(ALICE, 7, 1_000_000_000_000_000_000n)]}
                roundIndex={4}
                chainId={CHAIN_ID}
            />
        )

        // Pseudonymous means truncated on the page. The full address is still
        // reachable via copy and the explorer link, which is the intended seam.
        const text = document.body.textContent ?? ''
        expect(text).toContain('0x73AB…B657')
        expect(text).not.toContain(ALICE)
    })

    it('omits zero-address draws — those are rolls, not payments', () => {
        render(
            <_PrizesPaid
                draws={[draw(ZERO_ADDRESS, 7, 0n), draw(ALICE, 12, 500_000_000_000_000_000n)]}
                roundIndex={4}
                chainId={CHAIN_ID}
            />
        )

        // Rank is positional: Alice is the second draw, so she is the 2nd prize
        // even though she is the only recipient. Renumbering would misreport
        // which prize was paid.
        expect(screen.queryByTestId('prize-row-1')).not.toBeInTheDocument()
        expect(screen.getByTestId('prize-row-2')).toBeInTheDocument()
        expect(screen.getByTestId('prize-recipient-2')).toHaveTextContent('0x73AB…B657')
        expect(screen.queryByTestId('prizes-empty')).not.toBeInTheDocument()
    })

    it('shows the empty state when no draw has a recipient', () => {
        render(
            <_PrizesPaid
                draws={[draw(ZERO_ADDRESS, 7, 0n), draw(ZERO_ADDRESS, 12, 0n)]}
                roundIndex={4}
                chainId={CHAIN_ID}
            />
        )

        expect(screen.getByTestId('prizes-empty')).toHaveTextContent(
            'No match this draw — the prize pool rolled forward.'
        )
        expect(screen.queryByTestId('prize-row-1')).not.toBeInTheDocument()
    })

    it('shows loading copy naming the round, and no empty state', () => {
        render(<_PrizesPaid draws={[]} roundIndex={9} chainId={CHAIN_ID} isLoading />)

        expect(screen.getByTestId('prizes-loading')).toHaveTextContent(
            'Loading prizes for round 9 from the chain…'
        )
        // A component must not render nothing while it waits, and must not claim
        // "no match" before it knows.
        expect(screen.queryByTestId('prizes-empty')).not.toBeInTheDocument()
    })

    // Player-facing vocabulary is governed: no win/winner/winnings family,
    // no jackpot, no payout-to-winner. The on-chain field is still named
    // `winner`; only rendered strings are constrained.
    it('renders no prohibited vocabulary', () => {
        render(
            <_PrizesPaid
                draws={[draw(ALICE, 7, 1_000_000_000_000_000_000n)]}
                roundIndex={4}
                chainId={CHAIN_ID}
            />
        )

        const text = document.body.textContent ?? ''
        expect(text.length).toBeGreaterThan(20)
        expect(text).not.toMatch(/winner|winnings|\bwin\b|jackpot|lottery|gambl|payout/i)

        const labels = Array.from(document.querySelectorAll('[aria-label]'))
            .map((el) => el.getAttribute('aria-label'))
            .join(' ')
        expect(labels.length).toBeGreaterThan(0)
        expect(labels).not.toMatch(/winner|winnings|\bwin\b|jackpot|lottery|gambl|payout/i)
    })
})
