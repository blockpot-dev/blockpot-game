import CountOf from '@/components/core/CountOf/CountOf'
import { TERM, prizePoolLabel } from '@/constants/copy'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import useDrawRound from '@/hooks/contracts/draw/useDrawRound'
import { GameType } from '@/providers/SelectedGameProvider'
import { DrawRound } from '@/types/draw'
import { Container } from '@blockpot-dev/blockpot-design-system'
import { useMemo } from 'react'
import PrizeBadge from '../../current-round/Prizes/PrizeBadge/PrizeBadge'
import { Address, isAddressEqual } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import { ChevronRight } from 'lucide-react'
import { formatDateWithTime } from '@/utilities/time/format-date'
import { isPlayerWinner } from '@/utilities/draw/is-player-winner'

function extractBadgeData(round: DrawRound | null, accountAddress: Address) {
    if (!round) return ['', -1] as const
    const playerTierIndex = round.draws.findIndex((draw) => isPlayerWinner(draw.winner, accountAddress))
    if (playerTierIndex !== -1) {
        return ['Your prize', playerTierIndex + 1] as const
    }
    if (!isAddressEqual(round.draws[0].winner, ZERO_ADDRESS)) {
        return ['Top prize paid', 1] as const
    }
    const anyWinnerTierIndex = round.draws.findIndex((draw) => !isAddressEqual(draw.winner, ZERO_ADDRESS))
    if (anyWinnerTierIndex !== -1) {
        return ['Prize paid', anyWinnerTierIndex + 1] as const
    }
    return ['', -1] as const
}

const gameLabel = (gameType: GameType) => gameType === 'main' ? 'Main' : 'Quick'

export type _PreviousRoundProps = {
    round: DrawRound | null
    accountAddress: Address
    gameType: GameType
    viewRoundSummary: (round: DrawRound, gameType: GameType) => void
}

export function _PreviousRound(props: _PreviousRoundProps) {
    const { round, accountAddress, gameType, viewRoundSummary } = props

    const [badgeData, ordinal] = useMemo(() => {
        return extractBadgeData(round, accountAddress)
    }, [round, accountAddress])

    const isCurrentPlayerWinner = useMemo(
        () => !!round && round.draws.some((d) => isPlayerWinner(d.winner, accountAddress)),
        [round, accountAddress],
    )

    const formattedDate = useMemo(() => {
        if (!round) return ''
        return formatDateWithTime(new Date(round.drawTime))
    }, [round])


    return (
        <Container data-previous-round-card containerClassName='rounded-sm bg-gray-950 min-h-[120px]' className='p-4'>
            {
                round ? (
                    <VStack className='gap-4'>
                        <HStack className='justify-between'>
                            <VStack className='gap-0'>
                                {gameType !== 'quick' ? (
                                    <>
                                        <HStack className='gap-2 items-center'>
                                            <h3 className='text-md font-bold'>{TERM.draw} <CountOf value={round.roundIndexInPot + 1} total={round.maxRoundsInPot} connectorClassName='text-[0.85em]' /></h3>
                                            <span className='bg-gray-800 text-xs px-2 py-0.5 rounded-sm'>{gameLabel(gameType)}</span>
                                        </HStack>
                                        <span className='text-secondary-foreground'>{prizePoolLabel(round.potIndex)}</span>
                                    </>
                                ) : (
                                    <HStack className='gap-2 items-center'>
                                        <h3 className='text-md font-bold'>{prizePoolLabel(round.potIndex)}</h3>
                                        <span className='bg-gray-800 text-xs px-2 py-0.5 rounded-sm'>{gameLabel(gameType)}</span>
                                    </HStack>
                                )}
                            </VStack>
                            {
                                ordinal !== -1 && (
                                    <PrizeBadge ordinal={ordinal} filled={isCurrentPlayerWinner} className='w-auto h-[32px] px-2'>
                                        {badgeData}
                                    </PrizeBadge>
                                )
                            }
                        </HStack>
                        <HStack className='justify-between text-sm text-secondary-foreground'>
                            <span>{formattedDate}</span>
                            <button className='gap-1 inline-flex items-center text-secondary-foreground hover:text-foreground hover:cursor-pointer' onClick={() => viewRoundSummary(round, gameType)}>
                                View results
                                <ChevronRight size={20} className='translate-y-0.5' />
                            </button>
                        </HStack>
                    </VStack>
                ) : (
                    <div className='flex items-center min-h-[88px]'>
                        <span className='text-sm text-secondary-foreground'>Loading draw…</span>
                    </div>
                )
            }
        </Container>
    )
}

export type PreviousRoundProps = {
    accountAddress: Address
    roundIndex: number
    gameType: GameType
    viewRoundSummary: (round: DrawRound, gameType: GameType) => void
}

export default function PreviousRound(props: PreviousRoundProps) {
    const { roundIndex, accountAddress, gameType, viewRoundSummary } = props
    const round = useDrawRound(roundIndex, gameType)

    return <_PreviousRound round={round ?? null} accountAddress={accountAddress} gameType={gameType} viewRoundSummary={viewRoundSummary} />
}
