import VStack from '@/components/core/VStack/VStack'
import { cn } from '@/lib/utils'
import { PurchaseData } from '@/types/lottery/purchase'
import { formatNumber } from '@/utilities/formatters'
import { memo } from 'react'
import { LotteryDrawContext } from '@/providers/BlockpotDrawProvider'
import { Address } from 'viem'
import { getTicketImageAndVariantFromMatch, ticketContentVariants, TicketMatchResult } from '@/utilities/lottery/ticket-image'
import { isPlayerWinner } from '@/utilities/lottery/is-player-winner'

type PurchaseContentProps = {
    purchase: PurchaseData
    totalTickets: number
}

function PurchaseContent(props: PurchaseContentProps) {
    const { purchase, totalTickets } = props

    return (
        <>
            <div className='grow flex gap-2 justify-between z-1'>
                <span className='body-sm'>Purchase #{purchase.id.toFixed(0)}</span>
                <span className='body-sm font-bold'>{formatNumber(totalTickets)} Tickets</span>
            </div>
            {
                purchase.type === 'single' ? (
                    <div className='grow flex gap-2 justify-between z-1'>
                        <span className='body-sm'>Ticket Number:</span>
                        <span className='body-sm font-bold'>{formatNumber(purchase.number)}</span>
                    </div>
                ) : (
                    <VStack className='gap-3'>
                        <div className='grow flex gap-2 justify-between z-1'>
                            <span className='body-sm'>From:</span>
                            <span className='body-sm font-bold'>{formatNumber(purchase.numberStart)}</span>
                        </div>
                        <div className='grow flex gap-2 justify-between z-1'>
                            <span className='body-sm'>To:</span>
                            <span className='body-sm font-bold'>{formatNumber(purchase.numberEnd)}</span>
                        </div>
                    </VStack>

                )
            }
        </>
    )
}

export type PurchaseProps = {
    purchase: PurchaseData | 'placeholder'
    isFirst: boolean
    isConnected: boolean
    animationsEnabled: boolean
    draw?: LotteryDrawContext
    accountAddress?: Address
};

function getPurchaseTicketMatch(
    purchase: PurchaseData,
    draw: LotteryDrawContext | undefined,
    accountAddress: Address | undefined
): { match: TicketMatchResult | null; image: string; variant: 'neutral' | 'playerJackpot' | 'player2nd' | 'player3rd' | 'playerWinner' } {
    // Default values if no draw is active or no account address
    const defaultResult = {
        match: null,
        image: '/assets/pngs/ticket-blue.png',
        variant: 'neutral' as const
    }

    if (!draw || !accountAddress || draw.drawStage.type === 'waiting') {
        return defaultResult
    }

    // Get drawn numbers from the draw state
    // At this point, draw.drawStage.type can only be 'drawing' or 'complete'
    const drawnRound = draw.drawStage.type === 'drawing' || draw.drawStage.type === 'complete' 
        ? draw.drawStage.drawnRound 
        : null
    if (!drawnRound) {
        return defaultResult
    }

    // Use staged draw data when drawing (only revealed numbers), or all numbers when complete
    const isDrawing = draw.drawStage.type === 'drawing'
    const stagedDrawnNumbers = isDrawing ? draw.drawStage.stagedDraw.drawnNumbers : null
    const allDrawnNumbers = drawnRound.draws

    // Find matching drawn numbers
    const matches: TicketMatchResult[] = []

    if (purchase.type === 'single') {
        // Check if the single ticket number matches any drawn number
        if (isDrawing && stagedDrawnNumbers) {
            // When drawing, use staged data (DisplayDrawnNumberData) - only revealed numbers
            for (const drawnNumber of stagedDrawnNumbers) {
                if (drawnNumber.number === purchase.number) {
                    matches.push({
                        ordinal: drawnNumber.ordinal,
                        isPlayerWinner: isPlayerWinner(drawnNumber.winner, accountAddress),
                        winner: drawnNumber.winner
                    })
                    break // Only one match possible for a single ticket
                }
            }
        } else {
            // When complete, use all drawn numbers (DrawnNumber) - calculate ordinal from index
            for (let i = 0; i < allDrawnNumbers.length; i++) {
                const drawnNumber = allDrawnNumbers[i]
                if (drawnNumber.number === purchase.number) {
                    matches.push({
                        ordinal: i + 1,
                        isPlayerWinner: isPlayerWinner(drawnNumber.winner, accountAddress),
                        winner: drawnNumber.winner
                    })
                    break // Only one match possible for a single ticket
                }
            }
        }
    } else {
        // Check if any number in the range matches any drawn number
        // Create a set of ticket numbers for efficient lookup
        const ticketNumbers = new Set<number>()
        for (let ticketNumber = purchase.numberStart; ticketNumber <= purchase.numberEnd; ticketNumber++) {
            ticketNumbers.add(ticketNumber)
        }
        
        if (isDrawing && stagedDrawnNumbers) {
            // When drawing, use staged data (DisplayDrawnNumberData) - only revealed numbers
            for (const drawnNumber of stagedDrawnNumbers) {
                if (ticketNumbers.has(drawnNumber.number)) {
                    matches.push({
                        ordinal: drawnNumber.ordinal,
                        isPlayerWinner: isPlayerWinner(drawnNumber.winner, accountAddress),
                        winner: drawnNumber.winner
                    })
                }
            }
        } else {
            // When complete, use all drawn numbers (DrawnNumber) - calculate ordinal from index
            for (let i = 0; i < allDrawnNumbers.length; i++) {
                const drawnNumber = allDrawnNumbers[i]
                if (ticketNumbers.has(drawnNumber.number)) {
                    matches.push({
                        ordinal: i + 1,
                        isPlayerWinner: isPlayerWinner(drawnNumber.winner, accountAddress),
                        winner: drawnNumber.winner
                    })
                }
            }
        }
    }

    // If no matches, return default
    if (matches.length === 0) {
        return defaultResult
    }

    // Find the match with the lowest ordinal (highest tier)
    const bestMatch = matches.reduce((best, current) => 
        current.ordinal < best.ordinal ? current : best
    )

    // Get image and variant from the best match
    const { image, variant } = getTicketImageAndVariantFromMatch(bestMatch)
    return { match: bestMatch, image, variant }
}

function Purchase(props: PurchaseProps) {
    const { purchase, isFirst, isConnected, animationsEnabled, draw, accountAddress } = props

    let totalTickets: number
    if (purchase === 'placeholder') {
        totalTickets = 0
    } else {
        if (purchase.type === 'single') {
            totalTickets = 1
        } else {
            totalTickets = purchase.numberEnd - purchase.numberStart + 1
        }
    }

    const { image, variant } = purchase !== 'placeholder' 
        ? getPurchaseTicketMatch(purchase, draw, accountAddress)
        : { image: '/assets/pngs/ticket-blue.png', variant: 'neutral' as const }

    return (
        <VStack className="w-full h-[119px] h-min-[119px] relative justify-start gap-2">
            <img
                src={'/assets/svgs/ticket-outline.svg'}
                alt='Info'
                className={'absolute top-0 left-0 z-0 w-[252px] h-[119px]'}
            />
            {
                purchase !== 'placeholder' ? (
                    <div className={cn('relative z-1', animationsEnabled && 'animate-grow-in')}>
                        <img
                            src={image}
                            alt='Info'
                            className={'absolute top-0 left-0 z-0 w-[252px] h-[119px] filter-[drop-shadow(0_4px_8px_rgba(0,0,0,0.2))]'}
                        />
                        <div className='z-1 p-2 flex leading-[0.7]'>
                            <VStack className={ticketContentVariants({ variant })}>
                                <PurchaseContent purchase={purchase} totalTickets={totalTickets} />
                            </VStack>
                        </div>
                    </div>
                ) : isFirst && (
                    <div className='z-1 flex items-center justify-center h-full'>
                        <span className='uppercase text-secondary-foreground text-center text-sm'>
                            {
                                isConnected ? (
                                    <>
                                        Purchase a ticket<br />to enter draw
                                    </>
                                ) : (
                                    <>
                                        Connect Wallet To<br/>Purchase a Ticket
                                    </>
                                )
                            }
                        </span>
                    </div>
                )
            }
        </VStack>
    )
}

export default memo(Purchase)