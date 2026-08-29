import { Button, ConsentDialog, InfoBanner } from '@blockpot-dev/blockpot-design-system'
import { PretxRequiredAction } from '@/hooks/player/usePretxDeposit'
import { ClaimDecision } from '@/hooks/claim/types'
import HStack from '@/components/core/HStack/HStack'
import { SUPPORT_LINK_LABEL, SUPPORT_URL } from '@/constants/support'

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
const supportLink = (
    <a href={SUPPORT_URL} target='_blank' rel='noopener noreferrer' className='underline underline-offset-2'>
        {SUPPORT_LINK_LABEL}
    </a>
)

export default function ClaimDecisionView({ decision, onClose, onVerify, onRetry }: ClaimDecisionProps) {
    if (decision.allow) return null

    if (decision.requiredAction === 'SELF_EXCLUDED') {
        // Doctrine: claims are NEVER blocked by responsible-gaming controls
        // (CLAUDE.md "Withdraw means claim"). The service must not return this
        // reason for a claim — see BLO-760 (blockpot-service). If it still
        // does, surface it as a fault, not as a paused claim.
        console.error('[claim] service returned SELF_EXCLUDED for a claim decision; claims are never paused by self-exclusion (BLO-760)', decision)
        return (
            <InfoBanner tone='warn'>
                Something&apos;s wrong — claims aren&apos;t paused by self-exclusion. {supportLink}.
            </InfoBanner>
        )
    }

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
                We can&apos;t complete this claim yet. Our compliance team will contact you. {supportLink}.
            </InfoBanner>
        )
    }

    if (decision.requiredAction === 'SYBIL_BLOCK') {
        // Sybil clustering verdict — same neutrality rule as sanctions.
        return (
            <InfoBanner tone='block'>
                We can&apos;t complete this claim yet. Our compliance team is reviewing it. {supportLink}.
            </InfoBanner>
        )
    }

    if (TRANSIENT.includes(decision.requiredAction)) {
        return (
            <InfoBanner
                tone='info'
                action={
                    <Button size='sm' variant='default' onClick={onRetry}>
                        Retry claim
                    </Button>
                }
            >
                We can&apos;t confirm the amount right now.
            </InfoBanner>
        )
    }

    if (decision.requiredAction === 'GEO_BLOCK') {
        return (
            <InfoBanner tone='block'>
                Claims aren&apos;t available from your current region. {supportLink}.
            </InfoBanner>
        )
    }

    return (
        <InfoBanner
            tone='warn'
            action={
                <Button size='sm' variant='default' onClick={onRetry}>
                    Retry claim
                </Button>
            }
        >
            We couldn&apos;t complete this claim right now. Retry in a moment, or {supportLink}.
        </InfoBanner>
    )
}
