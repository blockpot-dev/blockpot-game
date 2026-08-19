import { Button, InfoBanner } from '@blockpot-dev/blockpot-design-system'
import { PrizePoolContext } from '@/hooks/player-summary/usePrizePoolContext'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

export type PrizePoolPreCommitBannerProps = {
    state: PlayerActivityState | undefined
    context: PrizePoolContext | undefined
    onVerify: () => void
    className?: string
}

function formatEur(minor: number): string {
    const major = minor / 100
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(major)
}

// Spec-named component (see `kyc-implementation-requirements.md` §7.7).
// Renders above the entry form on /play whenever a win of the prize pool's size
// would not fit inside the player's remaining outflow-cap headroom: the
// overflow slice would be paid into escrow and held until the next tier's
// gates pass. The held figure is approximate — it is priced at today's
// EUR rate and headroom may move before the draw settles.
//
// Hidden while the whole prize pool fits in headroom (including the unlimited
// top tier, whose headroom is effectively infinite).
export default function PrizePoolPreCommitBanner(props: PrizePoolPreCommitBannerProps) {
    const { state, context, onVerify, className } = props

    if (!state || !context) return null

    const heldEurMinor = Math.max(0, context.currentPrizePoolEurMinor - state.outflow.headroomEurMinor)
    if (heldEurMinor <= 0) return null

    const prizeEur = formatEur(context.currentPrizePoolEurMinor)
    const heldEur = formatEur(heldEurMinor)

    return (
        <InfoBanner
            tone='info'
            className={className}
            action={
                <Button size='sm' variant='default' onClick={onVerify}>
                    Verify now
                </Button>
            }
        >
            A win in this draw could be worth {prizeEur}. ≈ {heldEur} of a prize this size would be held until verification — verify now to claim it in full.
        </InfoBanner>
    )
}
