import { cn } from '@/lib/utils'
import styles from './PrizeBadge.module.css'

function ordinalToText(ordinal: number) {
    switch (ordinal) {
    case 1:
        return 'Jackpot'
    case 2:
        return '2nd'
    case 3:
        return '3rd'
    default:
        return '+ More'
    }
}

function ordinalToData(ordinal: number) {
    switch (ordinal) {
    case 1: return '1'
    case 2: return '2'
    case 3: return '3'
    default: return ''
    }
}

export type PrizeBadgeProps = {
    className?: string
    ordinal: number
    filled?: boolean
    children?: React.ReactNode
}

export default function PrizeBadge({ ordinal, filled, children, className }: PrizeBadgeProps) {
    return <div
        className={cn('w-[72px] h-[28px]', filled ? '' : 'bg-gray-950', styles['prize-badge'], className)}
        data-ordinal={ordinalToData(ordinal)}
        data-filled={filled || undefined}
    >
        <span className={cn('text-sm font-bold leading-none', filled ? '' : 'text-foreground')}>
            {children ?? ordinalToText(ordinal)}
        </span>
    </div>
}