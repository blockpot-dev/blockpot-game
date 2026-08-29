import { InfoBanner } from '@blockpot-dev/blockpot-design-system'
import { deriveCoolOffStatus } from './coolOffStatus'

export type CoolOffStatusBannerProps = {
    blockedUntil: bigint
    className?: string
}

// Player-facing cool-off status: surfaces WHEN entries reopen instead of the
// generic "paused" message. Renders nothing while the account is not blocked.
// Note: the entry block is orthogonal to tier — a team-applied tier override does not
// bypass it — so this banner renders regardless of the player's currentTier.
export default function CoolOffStatusBanner({ blockedUntil, className }: CoolOffStatusBannerProps) {
    const status = deriveCoolOffStatus(blockedUntil, Date.now() / 1000)
    if (!status.isCoolingOff) return null
    return (
        <InfoBanner tone='warn' className={className}>
            You&apos;ve set a cool-off. Entries reopen {status.endLabel} ({status.remainingLabel}). You can still claim prizes.
        </InfoBanner>
    )
}
