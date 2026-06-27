import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import PrizeBadge from './PrizeBadge/PrizeBadge'
import { cn } from '@/lib/utils'

export type Prize = {
    nativeToken: string
    tokenAmountFormatted: string
    fiatFormatted: string
}

export type PrizeRowProps = Prize & {
    ordinal: number
    isLast?: boolean
}

export default function PrizeRow(props: PrizeRowProps) {
    const { ordinal, nativeToken, tokenAmountFormatted, fiatFormatted, isLast } = props

    return <tr className={cn(!isLast && 'border-b border-border')}>
        <td className='w-full pl-2'>
            <PrizeBadge ordinal={ordinal} />
        </td>
        <td className='whitespace-nowrap pr-2'>
            <HStack className='gap-2 inline-flex items-center pt-2 pb-2'>
                <img className='w-6 h-6 min-w-6 min-h-6' src={`/assets/svgs/tokens/${nativeToken.toLowerCase()}.svg`} alt={nativeToken} />
                <VStack className='gap-0.5'>
                    <span className='leading-none font-bold'>{tokenAmountFormatted}</span>
                    <span className='text-sm leading-none text-secondary-foreground'>{fiatFormatted}</span>
                </VStack>
            </HStack>
        </td>
    </tr>
}