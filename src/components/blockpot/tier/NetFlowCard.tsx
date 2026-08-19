import { TriangleAlert } from 'lucide-react'
import TierBadge from '@/components/blockpot/tier/TierBadge'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'
import { cn } from '@/lib/utils'

export type NetFlowCardProps = {
    state: PlayerActivityState | undefined
    className?: string
}

// Mirror the TierUpgradePrompt breakpoints (TierUpgradePrompt.tsx WARN_RATIO /
// BLOCK_RATIO) so the hero colour and the toast escalation stay in lockstep.
const WARN_RATIO = 0.8
const BLOCK_RATIO = 0.95

const EUR_FORMAT = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
})

function formatEur(minor: number): string {
    return EUR_FORMAT.format(minor / 100)
}

type Zone = 'ok' | 'warn' | 'block'
type Direction = 'inflow' | 'outflow' | 'balanced'

type NetPosition = {
    absNetEurMinor: number
    direction: Direction
    activeCapEurMinor: number | null
    remainingEurMinor: number
    zone: Zone
}

// The gate model is netted: a single signed position (cumEntered − cumClaims)
// consumes the inflow cap while positive and the outflow cap while negative,
// so exactly one cap is being eaten into at any moment. The hero always shows
// the true |net| — only the zone ratio and the remaining amount clamp at the
// cap.
function deriveNetPosition(state: PlayerActivityState): NetPosition {
    const net = state.cumWageredEurMinor - state.cumClaimsEurMinor
    if (net === 0) {
        return {
            absNetEurMinor: 0,
            direction: 'balanced',
            activeCapEurMinor: null,
            remainingEurMinor: 0,
            zone: 'ok',
        }
    }
    const absNetEurMinor = Math.abs(net)
    const direction: Direction = net > 0 ? 'inflow' : 'outflow'
    const cap = direction === 'inflow' ? state.inflow.capEurMinor : state.outflow.capEurMinor
    if (cap === null) {
        return {
            absNetEurMinor,
            direction,
            activeCapEurMinor: null,
            remainingEurMinor: 0,
            zone: 'ok',
        }
    }
    const ratio = cap === 0 ? 1 : Math.min(absNetEurMinor / cap, 1)
    const zone: Zone = ratio >= BLOCK_RATIO ? 'block' : ratio >= WARN_RATIO ? 'warn' : 'ok'
    return {
        absNetEurMinor,
        direction,
        activeCapEurMinor: cap,
        remainingEurMinor: Math.max(0, cap - absNetEurMinor),
        zone,
    }
}

const ZONE_TEXT_COLOR: Record<Zone, string> = {
    ok: 'text-foreground',
    warn: 'text-warm-mid-500',
    block: 'text-destructive',
}

const DIRECTION_LABEL: Record<Direction, string> = {
    inflow: 'Entered so far',
    outflow: 'Claimed so far',
    balanced: 'All square',
}

function subcaption(position: NetPosition, tier: PlayerActivityState['currentTier']): string {
    if (position.direction === 'balanced') return 'Entries and claims are balanced'
    const noun = position.direction === 'inflow' ? 'entry' : 'claim'
    if (position.activeCapEurMinor === null) return `No ${noun} limit at ${tier}`
    return `counts toward your ${formatEur(position.activeCapEurMinor)} ${noun} limit`
}

function capLabel(capEurMinor: number | null): string {
    return capEurMinor === null ? 'Unlimited' : formatEur(capEurMinor)
}

// Dashboard-style replacement for the old FlowMeterBar: one big number for
// the net position, with the directional label naming whichever cap is
// currently being consumed and a footer keeping both caps visible. No CTA —
// the Verify button lives in TierUpgradePrompt rendered below it.
//
// Hidden when state is missing (wallet disconnected / chain reads not yet
// resolved / no policy seeded).
export default function NetFlowCard({ state, className }: NetFlowCardProps) {
    if (!state) return null

    const position = deriveNetPosition(state)

    return (
        <div
            role='group'
            aria-label={`${state.currentTier} net flow position`}
            data-slot='net-flow-card'
            className={cn('flex flex-col gap-2 w-full rounded-md border border-border bg-card/40 p-4', className)}
        >
            <div className='flex items-center justify-between'>
                <span className='text-xs font-semibold uppercase tracking-wide text-gray-300'>
                    {DIRECTION_LABEL[position.direction]}
                </span>
                <TierBadge tier={state.currentTier} size='sm' />
            </div>
            <span
                data-slot='net-flow-hero'
                data-zone={position.zone}
                className={cn('text-4xl font-semibold font-body', ZONE_TEXT_COLOR[position.zone])}
            >
                {formatEur(position.absNetEurMinor)}
            </span>
            <span className='text-sm text-secondary-foreground'>
                {subcaption(position, state.currentTier)}
            </span>
            {position.zone !== 'ok' && (
                <span
                    role='status'
                    data-slot='net-flow-warning'
                    data-zone={position.zone}
                    className={cn('flex items-center gap-1.5 text-sm', ZONE_TEXT_COLOR[position.zone])}
                >
                    <TriangleAlert aria-hidden className='size-4 shrink-0' />
                    {formatEur(position.remainingEurMinor)} left before
                    {position.direction === 'inflow' ? ' entries pause' : ' claims pause'}
                </span>
            )}
            <span className='text-xs text-gray-400'>
                {`Entry limit ${capLabel(state.inflow.capEurMinor)} · Claim limit ${capLabel(state.outflow.capEurMinor)}`}
            </span>
        </div>
    )
}
