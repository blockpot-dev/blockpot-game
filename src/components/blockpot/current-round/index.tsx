import Countdown from './Countdown/Countdown'
import { useDraw } from '@/providers/BlockpotProvider'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import RoundInfo, { RoundInfoProps } from './RoundInfo/RoundInfo'
import Prizes from './Prizes/Prizes'
import PrizePool, { PrizePoolProps } from './PrizePool/PrizePool'
import { Prize } from './Prizes/PrizeRow'

export type EntryInfoProps = {
    totalTickets: number
    yourTickets: number
}

export type CurrentRoundProps = {
    entryInfo: EntryInfoProps
    roundInfo: RoundInfoProps
    prizePool: PrizePoolProps
    prizes: Prize[]
};

export default function CurrentRound(props: CurrentRoundProps) {
    const draw = useDraw()
    const { currentRound, timeBetweenRounds } = draw
    const nextDrawTime = currentRound.drawTime

    return <VStack className='p-6 gap-12 min-h-[720px]'>
        <HStack className='gap-4'>
            <PrizePool {...props.prizePool} />
            <Prizes className='w-[252px]' prizes={props.prizes} />
        </HStack>
        <VStack className='gap-8'>
            <RoundInfo {...props.roundInfo} />
            <Countdown timeBetweenRounds={timeBetweenRounds} nextDrawTime={Number(nextDrawTime)} />
        </VStack>
    </VStack>
}