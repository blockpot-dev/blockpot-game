// The `ticket` vocabulary in this file and in the asset filenames it references
// is an ACCEPTED EXCEPTION to BLO-692's prize-draw identifier sweep. Founder
// decision, 5 September 2026 (BLO-830) — it was reviewed and deliberately not
// renamed, so do not re-raise it as an oversight.
//
// Why: the messaging guardrails govern *rendered strings*, and none of this is
// rendered. The scope would be eleven PNGs, one SVG and eight exports for zero
// player-visible change — and asset renames are the case where a missed
// reference ships a broken image rather than a compile error, in the draw UI.
//
// The same reasoning already applies elsewhere: `DrawnNumber.winner` keeps its
// name because it is the on-chain field, and "no support ticket" in
// WhyBlockpot is a different sense of the word.
//
// This is a decision not to do the work now, not a decision that the names are
// right. If these assets are ever regenerated for another reason, name the new
// ones with entry/prize vocabulary.
import { Address, isAddressEqual } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import { DisplayDrawnNumberData } from '@/types/draw/display-drawn-number-data'
import { cva } from 'class-variance-authority'

export type TicketMatchResult = {
    ordinal: number
    isPlayerWinner: boolean
    winner: Address
}

export type TicketImageAndVariant = {
    image: string
    variant: 'neutral' | 'playerTopPrize' | 'player2nd' | 'player3rd' | 'playerWinner'
}

/**
 * Gets the ticket image path based on ordinal, winner status, and player winner status
 */
export function getTicketImage(ordinal: number, isPlayerWinner: boolean, winner: Address): string {
    if (isPlayerWinner) {
        switch (ordinal) {
        case 1:
            return '/assets/pngs/drawn-ticket-player-top-prize.png'
        case 2:
            return '/assets/pngs/drawn-ticket-player-2nd.png'
        case 3:
            return '/assets/pngs/drawn-ticket-player-3rd.png'
        default:
            return '/assets/pngs/drawn-ticket-player-winner.png'
        }
    } else if (!isAddressEqual(winner, ZERO_ADDRESS)) {
        switch (ordinal) {
        case 1:
            return '/assets/pngs/drawn-ticket-other-top-prize.png'
        case 2:
            return '/assets/pngs/drawn-ticket-other-2nd.png'
        case 3:
            return '/assets/pngs/drawn-ticket-other-3rd.png'
        default:
            return '/assets/pngs/drawn-ticket-other-winner.png'
        }
    }
    return '/assets/pngs/drawn-ticket-no-winner.png'
}

/**
 * Gets the ticket image path from DisplayDrawnNumberData
 */
export function getDrawnNumberImage(drawnNumber: DisplayDrawnNumberData): string {
    return getTicketImage(drawnNumber.ordinal, drawnNumber.isPlayerWinner, drawnNumber.winner)
}

/**
 * Determines the variant (for styling) based on ordinal and winner status
 */
export function getTicketVariant(ordinal: number, hasWinner: boolean, isPlayerWinner: boolean): 'neutral' | 'playerTopPrize' | 'player2nd' | 'player3rd' | 'playerWinner' {
    if (!hasWinner) {
        return 'neutral'
    }
    switch (ordinal) {
    case 1:
        return isPlayerWinner ? 'playerTopPrize' : 'neutral'
    case 2:
        return isPlayerWinner ? 'player2nd' : 'neutral'
    case 3:
        return isPlayerWinner ? 'player3rd' : 'neutral'
    default:
        return isPlayerWinner ? 'playerWinner' : 'neutral'
    }
}

/**
 * Gets both the image path and variant from DisplayDrawnNumberData
 */
export function getTicketImageAndVariant(drawnNumber: DisplayDrawnNumberData): TicketImageAndVariant {
    const hasWinner = !isAddressEqual(drawnNumber.winner, ZERO_ADDRESS)
    return {
        image: getDrawnNumberImage(drawnNumber),
        variant: getTicketVariant(drawnNumber.ordinal, hasWinner, drawnNumber.isPlayerWinner)
    }
}

/**
 * Gets both the image path and variant from match result
 */
export function getTicketImageAndVariantFromMatch(match: TicketMatchResult): TicketImageAndVariant {
    const hasWinner = !isAddressEqual(match.winner, ZERO_ADDRESS)
    return {
        image: getTicketImage(match.ordinal, match.isPlayerWinner, match.winner),
        variant: getTicketVariant(match.ordinal, hasWinner, match.isPlayerWinner)
    }
}

/**
 * CVA variants for ticket content styling based on tier and winner status
 */
export const ticketContentVariants = cva('gap-4 px-5 pt-6 grow', {
    variants: {
        variant: {
            neutral: 'text-foreground',
            playerTopPrize: 'text-[#8D431E]',
            player2nd: 'text-[#4B4B4B]',
            player3rd: 'text-[#65382F]',
            playerWinner: 'text-[#181D3F]'
        }
    }
})
