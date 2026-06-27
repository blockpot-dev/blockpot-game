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
    const isQuickGame = selectedGame === 'quick'

    return (
        <HStack className='gap-4'>
            <RoundInfoStatContainer
                stats={isQuickGame
                    ? [{ label: 'Pot No.', value: `${formatNumber(potIndex, 0)}` }]
                    : [
                        { label: 'Pot No.', value: `${formatNumber(potIndex, 0)}` },
                        { label: 'Round No.', value: `${formatNumber(currentRound, 0)}/${formatNumber(maximumRounds, 0)}` }
                    ]
                }
                forceFlex={isQuickGame}
                imageUrl='/assets/pngs/number-badge.png'
                imageAlt='Pot and Round Info'
            />
            {!isQuickGame && (
                <RoundInfoStatContainer
                    stats={[
                        { label: 'Any Winner', value: `${formatNumberMaxDecimalsGreedy(winnerChance / 100, 0, 2)}%` }
                    ]}
                    imageUrl='/assets/pngs/chance-badge.png'
                    imageAlt='Chance Info'
                />
            )}
            <RoundInfoStatContainer
                stats={[
                    {
                        label: 'Total Tickets',
                        value: (
                            <CompactCountValue
                                value={totalTickets}
                                variant='animated'
                                unit='tickets'
                                description='Total tickets purchased for the current round.'
                            />
                        )
                    },
                    {
                        label: 'Your Tickets',
                        value: (
                            <CompactCountValue
                                value={yourTickets}
                                variant='static'
                                unit='tickets'
                                description='Your tickets purchased for the current round.'
                            />
                        )
                    }
                ]}
                imageUrl='/assets/pngs/tickets-badge.png'
                imageAlt='Tickets Info'
            />
        </HStack>
    )
}