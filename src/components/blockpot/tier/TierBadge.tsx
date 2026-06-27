import { cn } from '@/lib/utils'
import { PlayerTier } from '@/hooks/player-summary/usePlayerActivityState'

export type TierBadgeProps = {
    tier: PlayerTier
    size?: 'sm' | 'md'
    className?: string
}

const TIER_STYLES: Record<PlayerTier, { chip: string, label: string }> = {
    T0: { chip: 'bg-gray-700 text-gray-200 border-gray-600', label: 'Tier 0' },
    T1: { chip: 'bg-blue-900 text-blue-100 border-blue-700', label: 'Tier 1' },
    T2: { chip: 'bg-indigo-900 text-indigo-100 border-indigo-700', label: 'Tier 2' },
    T3: { chip: 'bg-purple-900 text-purple-100 border-purple-700', label: 'Tier 3' },
    T4: { chip: 'bg-amber-900 text-amber-100 border-amber-700', label: 'Tier 4' },
}

export default function TierBadge({ tier, size = 'md', className }: TierBadgeProps) {
    const styles = TIER_STYLES[tier]
    const sizeClasses = size === 'sm'
        ? 'text-[10px] px-1.5 py-0.5'
        : 'text-xs px-2 py-1'

    return (
        <span
            role='status'
            aria-label={`Current tier ${styles.label}`}
            className={cn(
                'inline-flex items-center gap-1 rounded-sm border font-semibold uppercase tracking-wide',
                styles.chip,
                sizeClasses,
                className,
            )}
        >
            {styles.label}
        </span>
    )
}
