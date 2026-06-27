import AnimatingNumber from '@/components/core/display/AnimatingNumber/AnimatingNumber'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCompactNumber, formatNumber, shouldCompact } from '@/utilities/formatters'
import { TooltipArrow } from '@radix-ui/react-tooltip'
import { ReactNode } from 'react'

export type CompactCountValueProps = {
    value: number
    variant: 'animated' | 'static'
    unit?: string
    description?: ReactNode
}

export default function CompactCountValue(props: CompactCountValueProps) {
    const { value, variant, unit, description } = props

    const fullValue = formatNumber(value, 0)
    const headline = unit ? `${fullValue} ${unit}` : fullValue

    let trigger: ReactNode
    if (shouldCompact(value)) {
        trigger = formatCompactNumber(value)
    } else if (variant === 'animated') {
        trigger = <AnimatingNumber value={fullValue} size='sm' />
    } else {
        trigger = fullValue
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span>{trigger}</span>
            </TooltipTrigger>
            <TooltipContent side='top'>
                <div className='bg-gray-800 px-4 py-2 text-sm rounded-md w-max'>
                    <div className='text-foreground font-bold'>{headline}</div>
                    {description && (
                        <div className='text-secondary-foreground text-xs mt-1'>{description}</div>
                    )}
                </div>
                <TooltipArrow width={12} height={6} className='fill-gray-800 translate-y-[-100%]' />
            </TooltipContent>
        </Tooltip>
    )
}
