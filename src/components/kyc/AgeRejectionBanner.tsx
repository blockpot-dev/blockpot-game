import { Button, InfoBanner } from '@blockpot-dev/block-pot-design-system'
import { PlayerKycStatus } from '@/hooks/player/usePlayerKyc'

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
export default function AgeRejectionBanner({ status, className }: AgeRejectionBannerProps) {
    if (!isAgeRejection(status)) return null
    return (
        <InfoBanner
            tone='block'
            className={className}
            action={
                <Button size='sm' variant='secondary' asChild>
                    <a href='mailto:support@blockpot.com?subject=Age%20verification%20review'>
                        Contact support
                    </a>
                </Button>
            }
        >
            We can&apos;t proceed with your account. If you believe this was a mistake, please reach out to our support team.
        </InfoBanner>
    )
}
