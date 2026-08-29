import VStack from '@/components/core/VStack/VStack'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TooltipArrow } from '@radix-ui/react-tooltip'
import { ReactNode } from 'react'

export type RoundInfoStatProps = {
    label: string
    value: ReactNode
    // Plain-language explanation of what the figure is, shown on hover/focus.
    description?: ReactNode
}

export default function RoundInfoStat(props: RoundInfoStatProps) {
    const { label, value, description } = props
    const stat = <VStack className='gap-3 items-center flex-1'>
        <span className='heading-3xl text-foreground leading-[0.8]'>{value}</span>
        <span className='text-sm text-secondary-foreground leading-[0.8]'>{label}</span>
    </VStack>
    if (!description) return stat
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className='flex flex-1 cursor-help' tabIndex={0}>{stat}</div>
            </TooltipTrigger>
            <TooltipContent side='top'>
                <div className='bg-gray-800 px-4 py-2 text-sm rounded-md max-w-[260px] text-secondary-foreground'>{description}</div>
                <TooltipArrow width={12} height={6} className='fill-gray-800 translate-y-[-100%]' />
            </TooltipContent>
        </Tooltip>
    )
}
