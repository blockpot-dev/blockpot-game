export default function calculateFormattedTimeRemaining(timeRemaining: number) {
    const completed = timeRemaining <= 0
    if (completed) {
        return {
            completed,
            formattedTimeRemaining: '00h 00m 00s'
        }
    }
    const secondsRemaining = (Math.floor(timeRemaining) % 60).toFixed(0).padStart(2, '0')
    const minutesRemaining = (Math.floor(timeRemaining / 60) % 60).toFixed(0).padStart(2, '0')
    const hoursRemaining = (Math.floor((timeRemaining / 60 / 60) % 24)).toFixed(0).padStart(2, '0')
    const daysRemaining = (Math.floor(timeRemaining / 60 / 60 / 24)).toFixed(0)

    return {
        completed,
        formattedTimeRemaining: `${daysRemaining}d ${hoursRemaining}h ${minutesRemaining}m ${secondsRemaining}s`
    }
}