import { Button, InfoBanner } from '@blockpot-dev/blockpot-design-system'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

export type TierUpgradePromptProps = {
    state: PlayerActivityState | undefined
    onVerify: () => void
    // When false, suppress the rendered banner but still let the zone-change
    // toasts fire. The banner duplicates TierBreakdown's inline CTA when the
    // player is viewing a non-current tier; AccountDialog hides the banner in
    // that case while keeping the component mounted so the toast ref doesn't
    // reset on every tab click.
    showBanner?: boolean
    className?: string
}

const WARN_RATIO = 0.8
const BLOCK_RATIO = 0.95

type Direction = 'inflow' | 'outflow'
type Zone = 'ok' | 'warn' | 'block'

type DirectionProgress = {
    direction: Direction
    zone: Zone
    ratio: number
    nextTier: string | null
    currentTier: string
}

function zoneFromRatio(ratio: number): Zone {
    if (ratio >= BLOCK_RATIO) return 'block'
    if (ratio >= WARN_RATIO) return 'warn'
    return 'ok'
}

// Unlimited sides carry ratio 0 by construction (usePlayerActivityState),
// so a top-tier player never escalates here.
function computeDirections(state: PlayerActivityState | undefined): DirectionProgress[] {
    if (!state) return []
    const nextTier = state.nextTier?.tier ?? null
    return ([
        { direction: 'inflow' as Direction, ratio: state.inflow.ratio },
        { direction: 'outflow' as Direction, ratio: state.outflow.ratio },
    ]).map(({ direction, ratio }) => ({
        direction,
        zone: zoneFromRatio(ratio),
        ratio,
        nextTier,
        currentTier: state.currentTier,
    }))
}

function copyForDirection(p: DirectionProgress): string {
    const upgradeTo = p.nextTier ? ` to upgrade to ${p.nextTier}` : ''
    if (p.direction === 'inflow') {
        return p.zone === 'block'
            ? `You're within 5% of your ${p.currentTier} entry allowance. Entries beyond it are blocked — verify now${upgradeTo} to keep playing.`
            : `You're approaching your ${p.currentTier} entry allowance. Start verification now${upgradeTo} so you can keep playing without a pause.`
    }
    return p.zone === 'block'
        ? `You're within 5% of your ${p.currentTier} claim allowance. Verify now${upgradeTo} to keep claiming past it without a pause on payouts.`
        : `You're approaching your ${p.currentTier} claim allowance. Start verification now${upgradeTo} so future payouts can settle without interruption.`
}

// Renders an upgrade prompt per direction past the warn ratio — the inflow
// side speaks to "keep playing" (the on-chain entry gate), the outflow side
// to "keep claiming" (the withdraw / direct-pay gate). Escalation follows
// max(inflow.ratio, outflow.ratio): the toast severity steps on whichever
// direction is closer to its cap. Each direction fires its own toast on
// zone-change and renders its own InfoBanner if past the warn ratio.
export default function TierUpgradePrompt({ state, onVerify, showBanner = true, className }: TierUpgradePromptProps) {
    const lastToastZoneRef = useRef<{ inflow: Zone, outflow: Zone }>({ inflow: 'ok', outflow: 'ok' })

    const directions = computeDirections(state)
    const inflowZone = directions.find((d) => d.direction === 'inflow')?.zone ?? 'ok'
    const outflowZone = directions.find((d) => d.direction === 'outflow')?.zone ?? 'ok'

    useEffect(() => {
        const last = lastToastZoneRef.current
        if (inflowZone !== last.inflow) {
            if (inflowZone === 'warn') {
                toast('Verification recommended', {
                    description: 'You\'re approaching your entry allowance. Start verification now to keep playing without interruption.',
                    duration: 8000,
                })
            } else if (inflowZone === 'block') {
                toast.warning('Verification required soon', {
                    description: 'You\'re within 5% of your entry allowance. Entries beyond it are blocked — please verify now.',
                    duration: 10_000,
                })
            }
            last.inflow = inflowZone
        }
        if (outflowZone !== last.outflow) {
            if (outflowZone === 'warn') {
                toast('Verification recommended', {
                    description: 'You\'re approaching your claim allowance. Start verification now to keep claiming without interruption.',
                    duration: 8000,
                })
            } else if (outflowZone === 'block') {
                toast.warning('Verification required soon', {
                    description: 'You\'re within 5% of your claim allowance. Please verify now to keep claiming.',
                    duration: 10_000,
                })
            }
            last.outflow = outflowZone
        }
    }, [inflowZone, outflowZone])

    const banners = directions.filter((d) => d.zone !== 'ok')
    if (!showBanner || banners.length === 0) return null

    return (
        <>
            {banners.map((p) => (
                <InfoBanner
                    key={p.direction}
                    tone={p.zone === 'block' ? 'block' : 'warn'}
                    className={className}
                    action={
                        <Button size='sm' variant='default' onClick={onVerify}>
                            Start verification
                        </Button>
                    }
                >
                    {copyForDirection(p)}
                </InfoBanner>
            ))}
        </>
    )
}
