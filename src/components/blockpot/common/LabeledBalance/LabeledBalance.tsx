import HStack from '@/components/core/HStack/HStack'
import { cn } from '@/lib/utils'
import { Container } from '@blockpot-dev/blockpot-design-system'
import { ReactNode } from 'react'

export type LabeledBalanceProps = {
    label: string
    balance: ReactNode
    imageSrc: string
    imageAlt: string
    className?: string
}

export default function LabeledBalance(props: LabeledBalanceProps) {
    const { imageSrc, label, balance, imageAlt, className } = props

    return (
        <Container containerClassName={cn('bg-gray-950 rounded-sm', className)} className="p-4">
            <HStack className='justify-between items-center'>
                <span className='text-sm text-white/60'>{label}</span>
                <HStack className='gap-2 items-center'>
                    <img src={imageSrc} alt={imageAlt} className="w-6 h-6" />
                    {balance}
                </HStack>
            </HStack>
        </Container>
    )
}