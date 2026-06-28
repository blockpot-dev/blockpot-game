import CountdownTime from './CountdownTime/CountdownTime'
import { useEffect, useState } from 'react'
import { useInterval } from '@/hooks/utilities/useInterval'
import { Container } from '@blockpot-dev/blockpot-design-system'

export type CountdownProps = {
        timeBetweenRounds: number
        nextDrawTime: number
    };

export default function Countdown(props: CountdownProps) {
    const [currentDate, setCurrentDate] = useState(Date.now())

    const { nextDrawTime } = props
    const { active, start, stop, toggle } = useInterval(() => setCurrentDate(Date.now()), 1000)

    useEffect(() => {
        start()
        return stop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nextDrawTime])

    const timeRemaining = Math.max(0, Number(nextDrawTime) - (currentDate / 1000))
    if (timeRemaining == 0 && active) {
        toggle()
    }

    const showWaitingText = timeRemaining <= 0

    return (
        <Container containerClassName='w-full bg-gray-950'>
            <div className='relative w-full'>
                <div className={`transition-opacity duration-300 ${showWaitingText ? 'opacity-0' : 'opacity-100'}`}>
                    <CountdownTime timeRemaining={timeRemaining} />
                </div>
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showWaitingText ? 'opacity-100' : 'opacity-0'}`}>
                    <span className='text-foreground heading-5xl uppercase animate-pulse'>Waiting to draw...</span>
                </div>
            </div>
        </Container>
    )
}