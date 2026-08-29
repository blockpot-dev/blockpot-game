import { TERM, TERM_TOP_PRIZE_ODDS, topPrizeOddsDescription } from '@/constants/copy'
import HStack from '@/components/core/HStack/HStack'
import { formatNumber, formatNumberMaxDecimalsGreedy } from '@/utilities/formatters'
import { RoundInfoStatContainer } from './RoundInfoStatContainer/RoundInfoStatContainer'
import { useSelectedGame } from '@/providers/SelectedGameProvider'
import CompactCountValue from './CompactCountValue/CompactCountValue'

export type RoundInfoProps = {
    potIndex: number
    currentRound: number
    maximumRounds: number
    winnerChance: number
    totalTickets: number
    yourTickets: number
}

export default function RoundInfo(props: RoundInfoProps) {
    const { potIndex, currentRound, maximumRounds, winnerChance, totalTickets, yourTickets } = props
    const { selectedGame } = useSelectedGame()
    const oddsFormatted = `${formatNumberMaxDecimalsGreedy(winnerChance / 100, 0, 2)}%`
    const isQuickGame = selectedGame === 'quick'

    return (
        <HStack className='gap-4'>
            <RoundInfoStatContainer
                stats={isQuickGame
                    ? [{ label: TERM.prizePool, value: `#${formatNumber(potIndex, 0)}` }]
                    : [
                        { label: TERM.prizePool, value: `#${formatNumber(potIndex, 0)}` },
                        { label: TERM.draw, value: `${formatNumber(currentRound, 0)} of ${formatNumber(maximumRounds, 0)}` }
                    ]
                }
                forceFlex={isQuickGame}
                imageUrl='/assets/pngs/number-badge.png'
                imageAlt=''
            />
            {!isQuickGame && (
                <RoundInfoStatContainer
                    stats={[
                        { label: TERM_TOP_PRIZE_ODDS, value: oddsFormatted, description: topPrizeOddsDescription(oddsFormatted) }
                    ]}
                    imageUrl='/assets/pngs/chance-badge.png'
                    imageAlt=''
                />
            )}
            <RoundInfoStatContainer
                stats={[
                    {
                        label: 'Total entries',
                        value: (
                            <CompactCountValue
                                value={totalTickets}
                                variant='animated'
                                unit='entries'
                                description='All entries in this draw.'
                            />
                        )
                    },
                    {
                        label: 'Your entries',
                        value: (
                            <CompactCountValue
                                value={yourTickets}
                                variant='static'
                                unit='entries'
                                description='Your entries in this draw.'
                            />
                        )
                    }
                ]}
                imageUrl='/assets/pngs/tickets-badge.png'
                imageAlt=''
            />
        </HStack>
    )
}