export function formatDate(seconds: number): string {
    const date = new Date(seconds * 1000)
  
    const options: Intl.DateTimeFormatOptions = {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    }
  
    const formatter = new Intl.DateTimeFormat('en-US', options)
  
    return formatter.format(date)
}

export function formatDateWithTime(date: Date): string {
    const localeDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    })
    const localeTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    })
    return `${localeDate} | ${localeTime}`
}