import CountOf from '@/components/core/CountOf/CountOf'
import { TERM, TERM_TOP_PRIZE_ODDS, topPrizeOddsDescription } from '@/constants/copy'
import HStack from '@/components/core/HStack/HStack'
import { formatEtherMaxDecimalsGreedy, formatNumber, formatNumberMaxDecimalsGreedy } from '@/utilities/formatters'
import { Container } from '@blockpot-dev/blockpot-design-system'
import RoundInfoStat from '../../common/RoundInfoStat/RoundInfoStat'
import HighlightDivider from '../../common/HighlightDivider/HighlightDivider'
import { useSelectedGame } from '@/providers/SelectedGameProvider'
import { ReactNode } from 'react'

export type DrawRoundInfoProps = {
    potIndex: number
    currentRound: number
    maximumRounds: number
    winnerChance: number
    prizePool: bigint
}

export default function DrawRoundInfo(props: DrawRoundInfoProps) {
    const { potIndex, currentRound, maximumRounds, winnerChance, prizePool } = props
    const prizePoolFormatted = formatEtherMaxDecimalsGreedy(prizePool, 2)
    const { selectedGame } = useSelectedGame()
    const isQuickGame = selectedGame === 'quick'
    const oddsFormatted = `${formatNumberMaxDecimalsGreedy(winnerChance / 100, 0, 2)}%`

    const stats: ReactNode[] = [
        <RoundInfoStat key='pot' label={TERM.prizePool} value={`#${formatNumber(potIndex, 0)}`} />
    ]

    if (!isQuickGame) {
        stats.push(
            <RoundInfoStat key='round' label={TERM.draw} value={<CountOf value={formatNumber(currentRound, 0)} total={formatNumber(maximumRounds, 0)} />} />,
            <RoundInfoStat key='odds' label={TERM_TOP_PRIZE_ODDS} value={oddsFormatted} description={topPrizeOddsDescription(oddsFormatted)} />
        )
    }

    stats.push(
        <RoundInfoStat
            key='prizePool'
            label='Top prize'
            value={
                <>
                    <div className='inline-block relative w-7 h-5 mr-2'>
                        <img className='absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-7 h-7' src='/icons/eth.svg' alt='ETH' />
                    </div>
                    <span className='leading-[0.8]'>{prizePoolFormatted}</span>
                </>
            }/>
    )

    const statsWithDividers: ReactNode[] = []
    stats.forEach((stat, index) => {
        if (index > 0) {
            statsWithDividers.push(<HighlightDivider key={`divider-${index}`} direction='vertical' />)
        }
        statsWithDividers.push(stat)
    })

    return (
        <Container containerClassName='overflow-hidden' className='relative overflow-hidden'>
            <div className='z-0 absolute top-0 left-0 w-full h-full bg-gray-950' />
            <svg className='z-1 absolute h-[180px] w-[470px] top-0 left-[50%] -translate-x-1/2 -translate-y-3/4 text-gray-400 mix-blend-color-dodge blur-[100px]' viewBox='0 0 470 180' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <ellipse cx='235' cy='90' rx='235' ry='90' fill='currentColor' />
            </svg>
            <HStack className='gap-4 z-2 relative'>
                {statsWithDividers}
            </HStack>
        </Container>
    )
}