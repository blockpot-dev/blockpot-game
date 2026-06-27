import { cn } from '@/lib/utils'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'

type CountdownUnitsProps = {
    unit: string
    value: string
}
function CountdownUnits(props: CountdownUnitsProps) {
    const { unit, value } = props
    return <VStack className='gap-0 items-center min-w-16'>
        <HStack className='font-nunito gap-0 text-foreground flex-nowrap w-full justify-center'>
            <span className='text-center heading-5xl line-height-[1.5rem]'>
                {value}
            </span>
        </HStack>
        <span className='text-base text-secondary-foreground'>{unit}</span>
    </VStack>
}

export type CountdownTimeProps = {
    timeRemaining: number
    className?: string
};

export default function CountdownTime(props: CountdownTimeProps) {
    const { timeRemaining, className } = props

    const secondsRemaining = (Math.floor(timeRemaining) % 60).toFixed(0).padStart(2, '0')
    const minutesRemaining = (Math.floor(timeRemaining / 60) % 60).toFixed(0).padStart(2, '0')
    const hoursRemaining = (Math.floor(timeRemaining / 60 / 60)).toFixed(0).padStart(2, '0')
    return (
        <VStack className={cn('items-center gap-4', className)}>
            <span className='heading-xl leading-[0.8] uppercase'>Next Draw</span>
            <HStack className='gap-9'>
                <CountdownUnits unit='Hours' value={hoursRemaining} />
                <div className='w-[1px] opacity-75 bg-linear-[rgba(1,1,1,0),white_50%,rgba(1,1,1,0)]' />
                <CountdownUnits unit='Minutes' value={minutesRemaining} />
                <div className='w-[1px] opacity-75 bg-linear-[rgba(1,1,1,0),white_50%,rgba(1,1,1,0)]' />
                <CountdownUnits unit='Seconds' value={secondsRemaining} />
            </HStack>
        </VStack>
    )
}