import { Button, InfoBanner } from '@blockpot-dev/blockpot-design-system'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

export type PendingCddBannerProps = {
    state: PlayerActivityState | undefined
    onVerify: () => void
    className?: string
}

function formatEur(minor: number): string {
    const major = minor / 100
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
    }).format(major)
}

// Post-draw banner for winnings held while the player verifies toward the
// next tier. The held amount is the slice of escrow beyond the player's
// outflow-cap headroom — entering never lands the player here; only money
// trying to leave the system does.
//
// Spec §2 mandates the "safe and waiting" framing — never use "locked".
export default function PendingCddBanner({ state, onVerify, className }: PendingCddBannerProps) {
    if (!state || state.pendingClaimEurMinor <= 0) return null

    const prizeEur = formatEur(state.pendingClaimEurMinor)

    return (
        <InfoBanner
            tone='warn'
            className={className}
            action={
                <Button size='sm' variant='default' onClick={onVerify}>
                    Verify now
                </Button>
            }
        >
            {prizeEur} of your winnings is safe and waiting beyond your current claim allowance. Verify to release it.
        </InfoBanner>
    )
}
