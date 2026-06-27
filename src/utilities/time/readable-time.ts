export function readableTime(seconds: number): string {
    const inPast = seconds < 0
    const units = [60, 60, 24, 7]
    const unitNames = ['second', 'minute', 'hour', 'day', 'week']
    let remaining = Math.abs(seconds)
    let index = 0
    while (remaining / units[index] > 1) {
        remaining /= units[index]
        index += 1
        if (index == unitNames.length - 1) {
            break
        }
    }
    const final = Math.floor(remaining)
    const pluralize = final !== 1
    const timeString = `${final.toFixed(0)} ${unitNames[index]}${pluralize ? 's' : ''}`
    if (inPast) {
        return `${timeString} ago`
    } else {
        return `in ${timeString}`
    }
}