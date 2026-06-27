import VStack from '@/components/core/VStack/VStack'
import { ReactNode } from 'react'

export type RoundInfoStatProps = {
    label: string
    value: ReactNode
}

export default function RoundInfoStat(props: RoundInfoStatProps) {
    const { label, value } = props
    return <VStack className='gap-3 items-center flex-1'>
        <span className='heading-3xl text-foreground leading-[0.8]'>{value}</span>
        <span className='text-sm text-secondary-foreground leading-[0.8]'>{label}</span>
    </VStack>
}