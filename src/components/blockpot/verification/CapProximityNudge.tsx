import { Button } from '@blockpot-dev/blockpot-design-system'
import useVerificationState, { useDismissNudge } from '@/hooks/player/useVerificationState'

// Surface 3 of the four silent-tier verification surfaces (BLO-675).
//
// One dismissible prompt when cumulative activity crosses 90% of the current
// cap, once per threshold. It replaces the old client-derived 0.8-warn /
// 0.95-block escalation, which showed every player a ladder they were mostly
// not climbing.
//
// WHY THE CLIENT DECIDES NOTHING HERE
//
// The crossing, the threshold key, and whether it has already been dismissed
// all arrive together in one `verification-state` response. This component
// renders or does not; it never computes a ratio, never compares against a
// cap, and never stores a dismissal locally.
//
// That matters for the "at most once" promise. A locally-remembered dismissal
// dies with the browser profile, so the nudge would return on a new device for
// a threshold the player already dismissed. The server row outlives the
// session, which is the only way the promise holds.
//
// The copy names no tier, no cap and no figure. It says an identity check is
// coming and offers to get it over with — a player who dismisses has lost
// nothing, because the check still arrives at the blocked action (Surface 1).

export type CapProximityNudgeProps = {
    /** Opens the verification flow now rather than waiting to be blocked. */
    onVerify: () => void
    className?: string
}

export default function CapProximityNudge({ onVerify, className }: CapProximityNudgeProps) {
    const { data } = useVerificationState()
    const dismiss = useDismissNudge()

    const proximity = data?.capProximity
    // Three separate reasons not to render, all from the same payload:
    // no cap to be near, not yet crossed, or already dismissed.
    if (!proximity || !proximity.crossed90Pct || proximity.dismissed) return null

    return (
        <div
            className={`flex items-start justify-between gap-4 rounded-lg border border-line bg-[rgba(255,255,255,0.04)] px-4 py-3 ${className ?? ''}`}
            data-slot='cap-proximity-nudge'
            data-testid='cap-proximity-nudge'
            data-threshold={proximity.threshold}
        >
            <p className='text-sm leading-relaxed text-secondary-foreground font-body'>
                You&apos;re close to the point where we&apos;ll need a quick identity check. You can get it out of
                the way now, or carry on and do it when it comes up.
            </p>
            <div className='flex shrink-0 items-center gap-2'>
                <Button size='sm' onClick={onVerify}>
                    VERIFY NOW
                </Button>
                <Button
                    variant='outline'
                    size='sm'
                    onClick={() => dismiss.mutate(proximity.threshold)}
                    disabled={dismiss.isPending}
                >
                    DISMISS
                </Button>
            </div>
        </div>
    )
}
