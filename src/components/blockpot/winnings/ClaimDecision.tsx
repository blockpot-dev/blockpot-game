import { Button, ConsentDialog, InfoBanner } from '@blockpot-dev/blockpot-design-system'
import { PretxRequiredAction } from '@/hooks/player/usePretxDeposit'
import { ClaimDecision } from '@/hooks/claim/types'
import HStack from '@/components/core/HStack/HStack'

export type ClaimDecisionProps = {
    decision: ClaimDecision
    onClose: () => void
    onVerify: () => void
    onRetry: () => void
}

const TRANSIENT: PretxRequiredAction[] = ['SEQUENCER_DOWN']

// Renders a non-Allow pretx decision into the matching surface — the
// full-screen ConsentDialog when verification is needed to claim, an inline
// banner for headroom decisions, neutral copy for sanctions hits, and a retry
// banner for transient feed errors. Never names a tier, cap, allowance or
// headroom figure (KB `blockpot/story-map` B-VIS-1/2).
export default function ClaimDecisionView({ decision, onClose, onVerify, onRetry }: ClaimDecisionProps) {
    if (decision.allow) return null

    if (decision.requiredAction === 'KYC_UPGRADE') {
        return (
            <ConsentDialog
                open={true}
                onOpenChange={(open) => { if (!open) onClose() }}
                title='Verify to claim'
                body={
                    <span>
                        Verification needed to claim this amount. It takes a few minutes.
                    </span>
                }
                required={[]}
                confirmLabel='Verify now'
                cancelLabel='Not now'
                onConfirm={onVerify}
                onCancel={onClose}
            />
        )
    }

    if (decision.requiredAction === 'HEADROOM_EXCEEDED' || decision.requiredAction === 'LIMIT_EXCEEDED') {
        // The service also sends `headroomEurMinor` here; it is deliberately
        // not rendered — the remaining headroom is ladder information.
        return (
            <InfoBanner
                tone='warn'
                action={
                    <HStack className='gap-2'>
                        <Button size='sm' variant='secondary' onClick={onClose}>
                            Not now
                        </Button>
                        <Button size='sm' variant='default' onClick={onVerify}>
                            Verify now
                        </Button>
                    </HStack>
                }
            >
                Verification needed to claim this amount. It takes a few minutes.
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
