import { SelfExclusionDuration } from '@/hooks/responsible-gaming/useSelfExclusion'

export const DURATION_OPTIONS: { value: SelfExclusionDuration; label: string; helper: string }[] = [
    { value: '24h', label: '24 hours', helper: 'A one-day pause.' },
    { value: '7d', label: '7 days', helper: 'A week away from Blockpot.' },
    { value: '30d', label: '30 days', helper: 'A month-long break.' },
    { value: '6mo', label: '6 months', helper: 'Ends only at the scheduled time. Useful for a sustained pause.' },
    {
        value: 'permanent',
        label: 'Permanent',
        helper: 'Can only be lifted after a review by the Blockpot team. Choose this if you want to stop entirely.',
    },
]

const DURATION_MS: Record<SelfExclusionDuration, number | null> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '6mo': 182 * 24 * 60 * 60 * 1000,
    permanent: null,
}

export function durationLabel(d: SelfExclusionDuration): string {
    return DURATION_OPTIONS.find((o) => o.value === d)?.label ?? d
}

// Client-side estimate of when an exclusion chosen now would end. The service
// sets the authoritative timestamp; this is only for the confirm dialog.
export function estimateEndsAt(d: SelfExclusionDuration, now: number = Date.now()): string | null {
    const ms = DURATION_MS[d]
    return ms === null ? null : new Date(now + ms).toISOString()
}

export function formatEndsAt(endsAt: string | null | undefined): string {
    if (!endsAt) return 'Permanent'
    try {
        const date = new Date(endsAt)
        if (Number.isNaN(date.getTime())) return endsAt
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return endsAt
    }
}
