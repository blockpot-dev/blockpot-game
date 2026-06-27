import { LossLimitPeriod } from '@/hooks/responsible-gaming/useLossLimits'

export const PERIOD_LABELS: Record<LossLimitPeriod, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
}

export const PERIOD_HELPERS: Record<LossLimitPeriod, string> = {
    daily: 'Resets every day at 00:00 UTC.',
    weekly: 'Resets every Monday at 00:00 UTC.',
    monthly: 'Resets on the 1st of each month at 00:00 UTC.',
}

export const PERIODS: LossLimitPeriod[] = ['daily', 'weekly', 'monthly']

export function eurMinorToMajorString(eurMinor: number | undefined): string {
    if (eurMinor === undefined || eurMinor === null) return ''
    return (eurMinor / 100).toFixed(2)
}

export function parseEurMajorToMinor(input: string): number | null {
    const trimmed = input.trim()
    if (!trimmed) return null
    const num = Number(trimmed)
    if (!Number.isFinite(num) || num < 0) return null
    return Math.round(num * 100)
}

export function formatEurMinor(eurMinor: number): string {
    const major = eurMinor / 100
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
        minimumFractionDigits: major === Math.floor(major) ? 0 : 2,
    }).format(major)
}

export function formatEffectiveAt(iso: string | null | undefined): string {
    if (!iso) return ''
    try {
        const date = new Date(iso)
        if (Number.isNaN(date.getTime())) return iso
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return iso
    }
}
