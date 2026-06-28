import { Link } from '@tanstack/react-router'
import { InfoBanner } from '@blockpot-dev/blockpot-design-system'
import useLossLimits, {
    LossLimit,
    LossLimitPeriod,
    LossLimitsState,
} from '@/hooks/responsible-gaming/useLossLimits'
import { formatEurMinor, PERIOD_LABELS, PERIODS } from './lossLimitCopy'

export type LossLimitWarningViewProps = {
    state: LossLimitsState | undefined
    className?: string
}

function configuredLimits(state: LossLimitsState | undefined): { period: LossLimitPeriod; limit: LossLimit }[] {
    if (!state) return []
    const out: { period: LossLimitPeriod; limit: LossLimit }[] = []
    for (const period of PERIODS) {
        const limit = state[period]
        if (limit) out.push({ period, limit })
    }
    return out
}

// Shown next to the entry submit button when the pre-tx gate has rejected the
// stake with a LIMIT_EXCEEDED verdict. We don't have the server-side consumed
// total here (the gate only returns the verdict, not the running net loss), so
// we surface every configured limit and link to /responsible-gaming where the
// player can review and adjust them.
export function LossLimitWarningView({ state, className }: LossLimitWarningViewProps) {
    const limits = configuredLimits(state)
    return (
        <InfoBanner tone='warn' className={className}>
            <div className='flex flex-col gap-1'>
                <strong>This stake would breach your loss limit.</strong>
                {limits.length > 0 ? (
                    <span className='text-xs'>
                        Active limits:{' '}
                        {limits
                            .map(({ period, limit }) => `${PERIOD_LABELS[period]} ${formatEurMinor(limit.amountEurMinor)}`)
                            .join(' · ')}
                    </span>
                ) : (
                    <span className='text-xs'>You currently have a loss limit configured for this period.</span>
                )}
                <span className='text-xs'>
                    Wins reduce the consumed amount within the same window.{' '}
                    <Link to='/responsible-gaming' className='underline'>Review your limits</Link>.
                </span>
            </div>
        </InfoBanner>
    )
}

export default function LossLimitWarning({ className }: { className?: string }) {
    const { state } = useLossLimits()
    return <LossLimitWarningView state={state} className={className} />
}
