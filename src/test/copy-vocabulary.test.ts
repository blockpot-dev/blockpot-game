// BLO-750: player-facing copy must not use the win / winner / winnings family
// or profit / earnings framing (CLAUDE.md "Player-facing copy"). Identifiers may
// keep those words; rendered text may not. Each component is rendered with a
// minimal fixture chosen to exercise the branch that used to say "You Won",
// "Any Winner", "Profit", "Referral earnings", "escrowed winnings".
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import type { Address } from 'viem'
import RoundInfo from '@/components/blockpot/current-round/RoundInfo/RoundInfo'
import DrawRoundInfo from '@/components/blockpot/round-draw/DrawRoundInfo/DrawRoundInfo'
import { _PreviousRound } from '@/components/blockpot/previous-rounds/PreviousRound/PreviousRound'
import DrawnNumberTicket from '@/components/blockpot/common/DrawnNumberTicket/DrawnNumberTicket'
import LifetimeStatsRow from '@/components/blockpot/winnings/LifetimeStatsRow'
import { ReferralEarningsView } from '@/components/blockpot/account/ReferralEarningsSection'
import { SelfExclusionBannerView } from '@/components/responsible-gaming/SelfExclusionBanner'
import type { DrawRound } from '@/types/draw'
import type { DisplayDrawnNumberData } from '@/types/draw/display-drawn-number-data'

vi.mock('@/providers/SelectedGameProvider', () => ({
    useSelectedGame: () => ({ selectedGame: 'main', setSelectedGame: vi.fn() }),
}))

// `win` alone is included on top of the issue's acceptance grep so "chance to
// win" phrasing is caught too.
const BANNED = /\b(win|wins|won|winner|winnings|profit|earnings)\b/i

const PLAYER = '0x1111111111111111111111111111111111111111' as Address
const OTHER = '0x2222222222222222222222222222222222222222' as Address
const ZERO = '0x0000000000000000000000000000000000000000' as Address

function drawnNumber(winner: Address, isPlayerWinner: boolean): DisplayDrawnNumberData {
    return {
        isPlayerWinner,
        number: 42,
        ordinal: 1,
        prize: { amount: 10n ** 18n, amountFormatted: '1', fiat: 0n, fiatFormatted: '$0.00', nativeToken: 'ETH' },
        winner,
    }
}

function round(winners: Address[]): DrawRound {
    return {
        roundIndex: 3,
        draws: winners.map((winner, i) => ({ winner, number: i + 1, prize: 10n ** 18n })),
        prizePool: 10n ** 18n,
        drawTime: Date.now(),
        entryCount: 10,
        potIndex: 1,
        roundIndexInPot: 2,
        chance: 3200,
        done: true,
        maxRoundsInPot: 10,
    }
}

function expectCleanBody() {
    const text = document.body.textContent ?? ''
    const match = text.match(BANNED)
    expect(match, `banned word "${match?.[0]}" rendered in: ${text}`).toBeNull()
}

afterEach(cleanup)

describe('player-facing copy vocabulary (BLO-750)', () => {
    it('RoundInfo states the odds without "winner"', () => {
        render(createElement(RoundInfo, { potIndex: 1, currentRound: 3, maximumRounds: 10, winnerChance: 3200, totalTickets: 5, yourTickets: 1 }))
        expectCleanBody()
        expect(document.body.textContent).toContain('Top prize odds')
        expect(document.body.textContent).toContain('32%')
    })

    it('DrawRoundInfo states the odds without "winner"', () => {
        render(createElement(DrawRoundInfo, { potIndex: 1, currentRound: 3, maximumRounds: 10, winnerChance: 1250, prizePool: 10n ** 18n }))
        expectCleanBody()
        expect(document.body.textContent).toContain('Top prize odds')
    })

    it.each([
        ['player matched', [OTHER, PLAYER]],
        ['top prize paid to another player', [OTHER, ZERO]],
        ['lower prize paid to another player', [ZERO, OTHER]],
        ['nothing paid', [ZERO, ZERO]],
    ])('PreviousRound badge — %s', (_, winners) => {
        render(createElement(_PreviousRound, { round: round(winners), accountAddress: PLAYER, gameType: 'main', viewRoundSummary: vi.fn() }))
        expectCleanBody()
    })

    it.each([
        ['player matched', drawnNumber(PLAYER, true)],
        ['another player matched', drawnNumber(OTHER, false)],
        ['no match', drawnNumber(ZERO, false)],
    ])('DrawnNumberTicket — %s', (_, dn) => {
        render(createElement(DrawnNumberTicket, { drawnNumber: dn, animate: false, advanceDraw: vi.fn() }))
        expectCleanBody()
    })

    it('LifetimeStatsRow labels', () => {
        render(createElement(LifetimeStatsRow, { enteredEurMinor: 10000n, wonEurMinor: 2500n, profitEurMinor: -7500n }))
        expectCleanBody()
        expect(document.body.textContent).toContain('Prizes')
        expect(document.body.textContent).toContain('Net')
        expect(document.body.textContent).toContain('-€75.00')
    })

    it('ReferralEarningsView', () => {
        render(createElement(ReferralEarningsView, {
            record: { status: 'suspended', effectiveShareBps: 2000, accrued: 10n ** 17n, lifetimeEarned: 10n ** 18n, lifetimeClaimed: 0n },
            onClaim: vi.fn(),
            isClaiming: false,
        }))
        expectCleanBody()
    })

    it('SelfExclusionBannerView with claimable prizes', () => {
        render(createElement(SelfExclusionBannerView, {
            record: { id: '1', duration: '7d', startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 7 * 86400e3).toISOString(), appliedBy: 'player' },
            hasClaimableWinnings: true,
        }))
        expectCleanBody()
    })
})
