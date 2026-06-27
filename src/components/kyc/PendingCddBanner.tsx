import { InfoBanner } from '@blockpot-dev/block-pot-design-system'
import { PlayerKycStatus } from '@/hooks/player/usePlayerKyc'

export type PendingCddBannerProps = {
    status: PlayerKycStatus | undefined
    className?: string
}

function formatEur(minor: number): string {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
    }).format(minor / 100)
}

// Shown inside /verify while winnings are held pending CDD. Copy must never
// say "locked" — §2 mandates the "safe and waiting" framing.
export default function PendingCddBanner({ status, className }: PendingCddBannerProps) {
    const pending = status?.pendingCddEurMinor
    if (!Number.isFinite(pending) || (pending as number) <= 0) return null
    return (
        <InfoBanner tone='warn' className={className}>
            Your prize of {formatEur(pending as number)} is safe. Complete verification to release it.
        </InfoBanner>
    )
}
