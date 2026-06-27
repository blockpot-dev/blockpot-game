import { useLottery } from '@/providers/BlockpotProvider'
import { useInterval } from '@/hooks/utilities/useInterval'
import { useEffect, useState } from 'react'

export default function useTimeRemaining() {
    const [currentDate, setCurrentDate] = useState(Date.now())
    const { currentRound } = useLottery()
    const { start, stop } = useInterval(() => setCurrentDate(Date.now()), 1000)
    useEffect(() => {
        start()
        return stop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRound.drawTime, currentRound.roundIndex])

    if (!currentRound) {
        return {
            formattedTimeRemaining: '00h 00m 00s',
            waitingToDraw: true,
        }
    }
    const timeRemaining = Math.max(0, Number(currentRound.drawTime) - (currentDate / 1000))

    const secondsRemaining = (Math.floor(timeRemaining) % 60).toFixed(0).padStart(2, '0')
    const minutesRemaining = (Math.floor(timeRemaining / 60) % 60).toFixed(0).padStart(2, '0')
    const hoursRemaining = (Math.floor(timeRemaining / 60 / 60)).toFixed(0).padStart(2, '0')
    const formattedTimeRemaining = `${hoursRemaining}h ${minutesRemaining}m ${secondsRemaining}s`

    return {
        formattedTimeRemaining,
        waitingToDraw: timeRemaining <= 0
    }
}