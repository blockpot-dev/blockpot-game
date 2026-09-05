import { Button } from '@blockpot-dev/blockpot-design-system'
import useVerificationState from '@/hooks/player/useVerificationState'

// Surface 4 of the four silent-tier verification surfaces (BLO-675).
//
// A status row in account settings that exists ONLY after the player has hit
// some verification surface. Before first contact it renders nothing at all —
// not an empty state, not a "you're verified to level X" line, nothing.
//
// WHY ABSENCE IS THE FEATURE
//
// This is the last place a standing verification menu could creep back in. A
// player who has never been asked for ID should find no evidence in the
// product that an identity system exists; showing them a "not yet verified"
// row is the tier ladder with different words. The row's whole job is to let a
// player who *started* verifying and walked away find their way back, and that
// player always has a first-contact stamp.
//
// The stamp is written when a surface opens, not when verification completes
// (see InlineVerification), precisely so the abandoning player is covered.

export type VerificationStatusRowProps = {
    /** Resumes an incomplete flow. Usually opens Surface 1. */
    onVerify: () => void
    className?: string
}

export default function VerificationStatusRow({ onVerify, className }: VerificationStatusRowProps) {
    const { data } = useVerificationState()

    // No stamp, no row. Also covers the loading case: rendering nothing while
    // state is in flight is correct here, because the honest default for this
    // surface is absence.
    if (!data?.firstVerificationContactAt) return null

    return (
        <div
            className={`flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3 ${className ?? ''}`}
            data-slot='verification-status-row'
            data-testid='verification-status-row'
        >
            <div className='flex flex-col gap-0.5'>
                <span className='text-sm text-foreground font-body'>Identity check</span>
                <span className='text-xs text-secondary-foreground font-body'>
                    You started one of these. Pick up where you left off whenever you like.
                </span>
            </div>
            <Button variant='outline' size='sm' onClick={onVerify}>
                CONTINUE
            </Button>
        </div>
    )
}
