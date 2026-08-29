import { Button, InfoBanner } from '@blockpot-dev/blockpot-design-system'
import { PlayerKycStatus } from '@/hooks/player/usePlayerKyc'
import { SUPPORT_LINK_LABEL, SUPPORT_URL } from '@/constants/support'

export type AgeRejectionBannerProps = {
    status: PlayerKycStatus | undefined
    className?: string
}

function isAgeRejection(status: PlayerKycStatus | undefined): boolean {
    const photoId = status?.gates.photo_id
    if (!photoId || photoId.status !== 'failed') return false
    const reason = (photoId.rejectionReason ?? '').toLowerCase()
    return reason.includes('age') || reason.includes('under 18') || reason.includes('minor')
}

// Hard-stop banner when Sumsub review rejects the applicant for being under
// 18. Blocks the rest of the stepper and surfaces support contact info.
// The "18" threshold is the Phase-1 default; per-jurisdiction minimum ages are
// a KB (compliance-kyc) check owned by compliance, not this component (BLO-759).
export default function AgeRejectionBanner({ status, className }: AgeRejectionBannerProps) {
    if (!isAgeRejection(status)) return null
    return (
        <InfoBanner
            tone='block'
            className={className}
            action={
                <Button size='sm' variant='secondary' asChild>
                    <a href={SUPPORT_URL} target='_blank' rel='noreferrer'>
                        {SUPPORT_LINK_LABEL}
                    </a>
                </Button>
            }
        >
            You must be 18 or over to enter. If this is a mistake, contact support.
        </InfoBanner>
    )
}
