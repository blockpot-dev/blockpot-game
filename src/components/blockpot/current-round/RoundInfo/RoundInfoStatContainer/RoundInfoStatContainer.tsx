import HStack from '@/components/core/HStack/HStack'
import { Container } from '@blockpot-dev/block-pot-design-system'
import RoundInfoStat, { RoundInfoStatProps } from '../../../common/RoundInfoStat/RoundInfoStat'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import HighlightDivider from '@/components/blockpot/common/HighlightDivider/HighlightDivider'


export type RoundInfoStatContainerProps = {
    stats: RoundInfoStatProps[]
    imageUrl: string
    imageAlt: string
    forceFlex?: boolean
}

export function RoundInfoStatContainer(props: RoundInfoStatContainerProps) {
    const { stats, imageUrl, imageAlt, forceFlex } = props

    const firstStat = stats[0]
    const firstStatComponent = <RoundInfoStat key={firstStat.label} label={firstStat.label} value={firstStat.value} />
    const remainingStats = stats.slice(1)

    const statsElements: ReactNode[] = remainingStats.reduce((acc, stat) => {
        return [
            ...acc,
            <HighlightDivider key={`${stat.label}-divider`} direction='vertical' />,
            <RoundInfoStat key={stat.label} label={stat.label} value={stat.value} />
        ]
    }, [firstStatComponent])

    return (
        <Container
            className='rounded-sm relative p-0 py-6'
            containerClassName={cn('bg-gray-950', stats.length > 1 || forceFlex ? 'flex-1' : 'w-[120px]')}
        >
            <img className='absolute -top-6 left-[50%] translate-x-[-50%] w-[80px] h-[80px]' src={imageUrl} alt={imageAlt} />
            <HStack className='justify-between pt-10'>
                {statsElements}
            </HStack>
        </Container>
    )
}