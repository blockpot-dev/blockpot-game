import { SelfExclusionDuration } from '@/hooks/responsible-gaming/useSelfExclusion'

export const DURATION_OPTIONS: { value: SelfExclusionDuration; label: string; helper: string }[] = [
    { value: '24h', label: '24 hours', helper: 'Short cooling-off — ends after one day.' },
    { value: '7d', label: '7 days', helper: 'A week away from Blockpot.' },
    { value: '30d', label: '30 days', helper: 'A month-long break.' },
    { value: '6mo', label: '6 months', helper: 'Cannot be lifted early. Useful for a sustained pause.' },
    {
        value: 'permanent',
        label: 'Permanent',
        helper: 'Only the Blockpot team can lift this. Choose only if you intend to stop for good.',
    },
]

export function durationLabel(d: SelfExclusionDuration): string {
    return DURATION_OPTIONS.find((o) => o.value === d)?.label ?? d
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
