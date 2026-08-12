// Copy helpers for the reality-check prompt (task 113). Sibling of
// lossLimitCopy.ts / selfExclusionCopy.ts.

/** "1 hour 12 minutes" style label for a session duration in milliseconds. */
export function formatSessionDuration(elapsedMs: number): string {
    const totalMinutes = Math.floor(elapsedMs / 60_000)
    if (totalMinutes < 1) return 'less than a minute'
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const parts: string[] = []
    if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
    if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
    return parts.join(' ')
}
