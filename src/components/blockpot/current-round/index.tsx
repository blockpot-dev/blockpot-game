import Countdown from './Countdown/Countdown'
import { useLottery } from '@/providers/BlockpotProvider'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import RoundInfo, { RoundInfoProps } from './RoundInfo/RoundInfo'
import Prizes from './Prizes/Prizes'
import Jackpot, { JackpotProps } from './Jackpot/Jackpot'
import { Prize } from './Prizes/PrizeRow'

export type EntryInfoProps = {
    totalTickets: number
    yourTickets: number
}

export type CurrentRoundProps = {
    entryInfo: EntryInfoProps
    roundInfo: RoundInfoProps
    jackpot: JackpotProps
    prizes: Prize[]
};

export default function CurrentRound(props: CurrentRoundProps) {
    const lottery = useLottery()
    const { currentRound, timeBetweenRounds } = lottery
    const nextDrawTime = currentRound.drawTime

    return <VStack className='p-6 gap-12 min-h-[720px]'>
        <HStack className='gap-4'>
            <Jackpot {...props.jackpot} />
            <Prizes className='w-[252px]' prizes={props.prizes} />
        </HStack>
        <VStack className='gap-8'>
            <RoundInfo {...props.roundInfo} />
            <Countdown timeBetweenRounds={timeBetweenRounds} nextDrawTime={Number(nextDrawTime)} />
        </VStack>
    </VStack>
}