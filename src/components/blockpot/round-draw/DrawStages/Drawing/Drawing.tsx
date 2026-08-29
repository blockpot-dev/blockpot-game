import { cn } from '@/lib/utils'
import { StagedDraw } from '@/providers/BlockpotDrawProvider'
import { formatNumber } from '@/utilities/formatters'
import { Address } from 'viem'

function DrawNumber(props: { number: number }) {
    const { number } = props

    return <div className={cn('text-white text-center font-display font-normal text-[8rem] animate-reveal-in-out opacity-0')}>
        {formatNumber(number, 0)}
    </div>
}

export type DrawingProps = {
    accountAddress: Address
    stagedDraw: StagedDraw
}

export default function Drawing(props: DrawingProps) {
    const { stagedDraw } = props

    if (stagedDraw.drawnNumbers.length === 0) {
        return <span className='text-foreground heading-5xl uppercase animate-pulse text-center'>First number coming up…</span>
    }

    const number = stagedDraw.drawnNumbers.length > 0 ? stagedDraw.drawnNumbers[stagedDraw.drawnNumbers.length - 1].number : 0
    return (
        <DrawNumber key={stagedDraw.drawnNumbers.length - 1} number={number} />
    )
}