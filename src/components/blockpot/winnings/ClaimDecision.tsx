import { Button, ConsentDialog, InfoBanner } from '@blockpot-dev/block-pot-design-system'
import { PretxRequiredAction } from '@/hooks/player/usePretxDeposit'
import { ClaimDecision } from '@/hooks/claim/types'

export type ClaimDecisionProps = {
    decision: ClaimDecision
    onClose: () => void
    onVerify: () => void
    onRetry: () => void
}

const TRANSIENT: PretxRequiredAction[] = ['SEQUENCER_DOWN']

function formatEur(minor: number): string {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
    }).format(minor / 100)
}

// Renders a non-Allow pretx decision into the matching surface — the
// full-screen ConsentDialog for the Tier 0 → Tier 1 escalation, an inline
// banner for cap violations, neutral copy for sanctions hits, and a retry
// banner for transient feed errors.
export default function ClaimDecisionView({ decision, onClose, onVerify, onRetry }: ClaimDecisionProps) {
    if (decision.allow) return null

    if (decision.requiredAction === 'KYC_UPGRADE') {
        return (
            <ConsentDialog
                open={true}
                onOpenChange={(open) => { if (!open) onClose() }}
                title='Verify to continue'
                body={
                    <span>
                        Tier 0 accounts can only claim up to your starter cap. Verify your
                        identity to unlock larger claims.
                    </span>
                }
                required={[
                    {
                        id: 'understood',
                        label: 'I understand verification is required to continue this claim.',
                    },
                ]}
                confirmLabel='Verify now'
                cancelLabel='Cancel'
                onConfirm={onVerify}
                onCancel={onClose}
            />
        )
    }

    if (decision.requiredAction === 'HEADROOM_EXCEEDED' || decision.requiredAction === 'LIMIT_EXCEEDED') {
        // Partial-claim suggestion: the service sends the remaining outflow
        // headroom on HEADROOM_EXCEEDED; whatever escrow fits inside it is
        // claimable right now.
        const suggestionEurMinor = decision.headroomEurMinor ?? 0
        return (
            <InfoBanner
                tone='warn'
                action={
                    <Button size='sm' variant='default' onClick={onVerify}>
                        Verify to raise cap
                    </Button>
                }
            >
                {suggestionEurMinor > 0
                    ? `This amount exceeds your current claim allowance. You can claim up to ${formatEur(suggestionEurMinor)} right now — verify to release the rest.`
                    : 'This amount exceeds your current claim allowance. Verify to raise the cap.'}
            </InfoBanner>
        )
    }

    if (decision.requiredAction === 'SANCTIONS_BLOCK') {
        // Spec §16: never reveal sanctions detail to the user. Neutral copy only.
        return (
            <InfoBanner tone='block'>
                We&apos;re unable to process this claim; our compliance team will be in touch.
            </InfoBanner>
        )
    }

    if (decision.requiredAction === 'SYBIL_BLOCK') {
        // Sybil clustering verdict — same neutrality rule as sanctions.
        return (
            <InfoBanner tone='block'>
                We&apos;re unable to process this transaction; our compliance team will review.
            </InfoBanner>
        )
    }

    if (TRANSIENT.includes(decision.requiredAction)) {
        return (
            <InfoBanner
                tone='info'
                action={
                    <Button size='sm' variant='default' onClick={onRetry}>
                        Retry
                    </Button>
                }
            >
                Pricing temporarily unavailable, please retry.
            </InfoBanner>
        )
    }

    if (decision.requiredAction === 'SELF_EXCLUDED') {
        return (
            <InfoBanner tone='block'>
                Claims are paused while a self-exclusion is active on your account.
            </InfoBanner>
        )
    }

    if (decision.requiredAction === 'GEO_BLOCK') {
        return (
            <InfoBanner tone='block'>
                Claims to your current region are not supported.
            </InfoBanner>
        )
    }

    return (
        <InfoBanner tone='warn'>
            We could not process this claim right now. Please try again shortly.
        </InfoBanner>
    )
}
