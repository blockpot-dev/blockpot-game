import { useEffect } from 'react'
import { Button } from '@blockpot-dev/blockpot-design-system'
import SumsubSdkHost from '@/components/kyc/SumsubSdkHost'
import { KycTier } from '@/hooks/player/usePlayerKyc'
import { useRecordVerificationContact } from '@/hooks/player/useVerificationState'
import { formatEurFromMinor } from '@/utilities/formatEur'

// Surface 1 of the four silent-tier verification surfaces (BLO-675).
//
// The player never navigates to verification. Verification comes to the action:
// something they tried is paused, one sentence says why, the Sumsub flow is
// embedded right here, and on completion the paused action resumes on its own.
//
// WHAT THIS MUST NOT SAY
//
// No tier names, no caps, no ladder — Phase 1 hides all of it, and the whole
// point of the silent-tier design is that a player meets verification exactly
// when something they are doing requires it, not before. The reason line says
// what is blocked and what unblocks it, and stops.
//
// Vocabulary is claim and enter. Never withdraw, never deposit: players are
// never custodied, and the outflow is a claim on a prize they already hold.

export type VerificationSurfaceReason =
    | { kind: 'claim_over_headroom'; requiredEurMinor: number }
    | { kind: 'claim_new_wallet' }
    | { kind: 'stake_would_cross_cap'; capEurMinor: number }

export type InlineVerificationProps = {
    reason: VerificationSurfaceReason
    /**
     * Re-runs the action the player was blocked on. Called once, on a
     * successful verification — the promise of this surface is that the thing
     * they were doing carries on, not that they are returned to the start.
     */
    onResume: () => void
    onCancel?: () => void
    /** Tier to verify toward. Backend state; never rendered. */
    targetTier?: KycTier
}

// One sentence per reason. Each says what is paused and what releases it.
function reasonSentence(reason: VerificationSurfaceReason): string {
    switch (reason.kind) {
    case 'claim_over_headroom':
        return `Claiming ${formatEurFromMinor(reason.requiredEurMinor)} needs a quick identity check first. Your prize is safe while you do it.`
    case 'claim_new_wallet':
        return 'Claiming to a different wallet needs a quick identity check first. Your prize is safe while you do it.'
    case 'stake_would_cross_cap':
        return `Entering this much needs a quick identity check first. You can enter up to ${formatEurFromMinor(reason.capEurMinor)} without one.`
    }
}

export default function InlineVerification({
    reason,
    onResume,
    onCancel,
    targetTier = 'T1',
}: InlineVerificationProps) {
    const recordContact = useRecordVerificationContact()

    // Stamp first contact when the surface opens, not when verification
    // completes: Surface 4 exists so a player who started and walked away can
    // find their way back, and that player never reaches completion.
    //
    // Fire-and-forget on purpose. If the stamp fails the player still verifies;
    // the only cost is that the settings row does not appear yet, and the next
    // surface open re-stamps.
    const { mutate: stampContact } = recordContact
    useEffect(() => {
        stampContact()
    }, [stampContact])

    // A plain div rather than VStack: VStack takes only children/className/ref,
    // so the slot and reason attributes a reviewer (and the tests) need to
    // identify this surface would be silently dropped.
    return (
        <div
            className='flex flex-col gap-4'
            data-slot='inline-verification'
            data-testid='inline-verification'
            data-reason={reason.kind}
        >
            <p className='text-sm text-foreground font-body leading-relaxed'>
                {reasonSentence(reason)}
            </p>

            <SumsubSdkHost targetTier={targetTier} onComplete={onResume} />

            {onCancel && (
                <div className='flex justify-end'>
                    <Button variant='outline' size='default' onClick={onCancel}>
                        NOT NOW
                    </Button>
                </div>
            )}
        </div>
    )
}
