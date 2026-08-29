import { useEffect, useRef } from 'react'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { cn } from '@/lib/utils'
import { DisplayDrawnNumberData } from '@/types/draw/display-drawn-number-data'
import { countDigits, formatAccountAddress, formatNumber, getDrawnNumberFontSizePx } from '@/utilities/formatters'
import { ZERO_ADDRESS } from '@/web3/constants'
import { Address, isAddressEqual } from 'viem'
import { getDrawnNumberImage, getTicketVariant, ticketContentVariants } from '@/utilities/draw/ticket-image'

function formatWinner(address: Address, isPlayerWinner: boolean) {
    if (isPlayerWinner) {
        return 'Your prize'
    } else if (address === ZERO_ADDRESS) {
        return 'No match'
    } else {
        return formatAccountAddress(address)
    }
}

function ordinalToText(ordinal: number) {
    switch (ordinal) {
    case 1:
        return '1st'
    case 2:
        return '2nd'
    case 3:
        return '3rd'
    default:
        // this is fine because we are only drawing up to 10 numbers
        return `${ordinal}th`
    }
}

function DrawnNumberContent(props: { drawnNumber: DisplayDrawnNumberData }) {
    const { drawnNumber } = props
    const formattedDrawnNumber = formatNumber(drawnNumber.number)
    const digits = countDigits(drawnNumber.number)
    const fontSize = getDrawnNumberFontSizePx(digits)
    const variant = getTicketVariant(drawnNumber.ordinal, !isAddressEqual(drawnNumber.winner, ZERO_ADDRESS), drawnNumber.isPlayerWinner)
    return (
        <VStack className={ticketContentVariants({ variant })}>
            <HStack className='justify-between'>
                <span className='body-sm font-bold'>{ordinalToText(drawnNumber.ordinal)}</span>
                <span className={cn('body-sm', drawnNumber.isPlayerWinner ? 'font-bold' : '')}>{formatWinner(drawnNumber.winner, drawnNumber.isPlayerWinner)}</span>
            </HStack>
            <HStack className='justify-between items-center'>
                <span className='font-bold leading-[0.8]' style={{ fontSize: `${fontSize}px` }}>{formattedDrawnNumber}</span>
                <HStack className='gap-2 inline-flex items-center'>
                    <img className='w-6 h-6 min-w-6 min-h-6' src={`/assets/svgs/tokens/${'eth'}.svg`} alt={'eth'} />
                    <VStack className='gap-0.5'>
                        <span className='body-sm leading-none font-bold'>{drawnNumber.prize.amountFormatted}</span>
                        <span className={cn('body-xs leading-none', variant === 'neutral' && 'text-secondary-foreground')}>{drawnNumber.prize.fiatFormatted}</span>
                    </VStack>
                </HStack>
            </HStack>
        </VStack>
    )
}

export type DrawnNumberTicketProps = {
    drawnNumber: DisplayDrawnNumberData | 'placeholder'
    animate?: boolean
    isLastTicket?: boolean
    /** 1-based slot index, used for the "Waiting for number N…" placeholder copy. */
    placeholderOrdinal?: number
    advanceDraw: () => void
};

export default function DrawnNumberTicket(props: DrawnNumberTicketProps) {
    const { drawnNumber, animate = true, isLastTicket = false, placeholderOrdinal, advanceDraw } = props
    const animatedElementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = animatedElementRef.current
        if (!element || !animate || !isLastTicket || drawnNumber === 'placeholder') return

        const handleAnimationEnd = (e: AnimationEvent) => {
            if (e.animationName === 'grow-in') {
                setTimeout(() => advanceDraw(), 2900) // 3500ms - 600ms (animation duration)
            }
        }

        element.addEventListener('animationend', handleAnimationEnd)
        return () => element.removeEventListener('animationend', handleAnimationEnd)
    }, [animate, isLastTicket, drawnNumber, advanceDraw])

    return (
        <VStack className="w-full h-[119px] relative justify-start gap-2">
            <img
                src={'/assets/svgs/ticket-outline.svg'}
                alt='Info'
                className={'absolute top-0 left-0 z-0 w-[252px] h-[119px]'}
            />
            {
                drawnNumber === 'placeholder' && placeholderOrdinal !== undefined && (
                    <div className='relative z-1 flex items-center justify-center h-full'>
                        <span className='uppercase text-secondary-foreground text-center text-sm'>
                            Waiting for number {placeholderOrdinal}…
                        </span>
                    </div>
                )
            }
            {
                drawnNumber !== 'placeholder' && (
                    <div ref={animatedElementRef} className={cn('relative z-1', animate && 'animate-grow-in')}>
                        <img
                            src={getDrawnNumberImage(drawnNumber)}
                            alt='Info'
                            className={'absolute top-0 left-0 z-0 w-[252px] h-[119px] filter-[drop-shadow(0_4px_8px_rgba(0,0,0,0.2))]'}
                        />

                        <div className='relative z-1 p-2 flex leading-[0.7]'>
                            <DrawnNumberContent drawnNumber={drawnNumber} />
                        </div>
                    </div>
                )
            }
        </VStack>
    )
}