import { Button } from '@blockpot-dev/blockpot-design-system'
import { CheckCircle2, Loader2, Lock } from 'lucide-react'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { GateRecord, GateType } from '@/hooks/player/usePlayerKyc'
import type { PlayerActivityState, PlayerTier } from '@/hooks/player-summary/usePlayerActivityState'
import type { TierPolicy } from '@/hooks/contracts/kyc/useActivePolicy'
import { GATE_BIT_POSITION, GATE_DISPLAY, gatesFromBitmask, unknownGateBits } from '@/lib/kyc/gateBitmask'
import { formatNumber } from '@/utilities/formatters'
import { cn } from '@/lib/utils'
import TierBadge from './TierBadge'

export type TierBreakdownProps = {
    currentTier: PlayerTier
    // Gaming-service records — supply pending/expired/failed overlays only.
    // "passed" is read from `onChainGates` because the contract bitmap is the
    // cryptographically authoritative source; the service map can lag or
    // omit records the chain already knows about (esp. on devnet where bits
    // are seeded directly).
    gates: Partial<Record<GateType, GateRecord>> | undefined
    onChainGates: bigint
    tiers: readonly TierPolicy[]
    // Tab selection is controlled by the parent so the dialog can decide,
    // e.g., whether to render the wager-allowance banner (which only makes
    // sense while viewing the player's current tier).
    selectedTierIdx: number
    onSelectedTierChange: (idx: number) => void
    // Verification progress toward the tier above the player's current one —
    // `missingGates` drives the "Needed for next tier" checklist below the
    // per-tier requirement rows.
    nextTier?: PlayerActivityState['nextTier']
    onVerify: () => void
    className?: string
}

function formatEurMinor(value: bigint): string {
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) return formatNumber(Number.MAX_SAFE_INTEGER / 100, 0)
    return formatNumber(Number(value) / 100, 0)
}

function isUnlimitedCap(value: bigint): boolean {
    return value > BigInt(Number.MAX_SAFE_INTEGER)
}

type RowStatus = 'passed' | 'pending' | 'locked'

function rowStatus(gate: GateType, record: GateRecord | undefined, onChainGates: bigint): RowStatus {
    const bitSet = (onChainGates & (1n << BigInt(GATE_BIT_POSITION[gate]))) !== 0n
    if (bitSet) return 'passed'
    if (record?.status === 'pending') return 'pending'
    return 'locked'
}

// Fallback row for required-gate bits this build's gate table doesn't know
// about (chain policy ahead of the frontend). Rendering them keeps the
// requirement list honest — dropping them shows a falsely complete checklist
// on a tier the player can't actually reach.
const UNKNOWN_GATE_DISPLAY = {
    label: 'Additional verification',
    description: 'A new requirement this app version can\'t display yet — refresh the page or contact support',
}

function unknownBitStatus(bit: number, onChainGates: bigint): RowStatus {
    return (onChainGates & (1n << BigInt(bit))) !== 0n ? 'passed' : 'locked'
}

function StatusIcon({ status }: { status: RowStatus }) {
    if (status === 'passed') return <CheckCircle2 className='size-4 text-emerald-400 shrink-0' aria-hidden />
    if (status === 'pending') return <Loader2 className='size-4 text-amber-300 animate-spin shrink-0' aria-hidden />
    return <Lock className='size-4 text-secondary-foreground shrink-0' aria-hidden />
}

type RequirementRowProps = {
    label: string
    description: string
    status: RowStatus
}

function RequirementRow({ label, description, status }: RequirementRowProps) {
    return (
        <HStack className='items-start gap-3'>
            <StatusIcon status={status} />
            <VStack className='gap-0.5 flex-1'>
                <span className={cn(
                    'text-sm font-medium',
                    status === 'locked' ? 'text-secondary-foreground' : 'text-foreground',
                )}
                >
                    {label}
                </span>
                <span className='text-xs text-secondary-foreground'>{description}</span>
            </VStack>
        </HStack>
    )
}

export default function TierBreakdown({
    currentTier,
    gates,
    onChainGates,
    tiers,
    selectedTierIdx,
    onSelectedTierChange,
    nextTier,
    onVerify,
    className,
}: TierBreakdownProps) {
    // `currentTier` is the canonical "T${n}" string from
    // `usePlayerActivityState`; parse it back to a numeric index. Clamp to
    // the policy ladder so a malformed `currentTier` (e.g. policy shrunk
    // under the player) still renders something sensible.
    const tierCount = tiers.length
    const parsedCurrent = parseInt(currentTier.slice(1), 10)
    const currentIdx = tierCount === 0
        ? 0
        : Math.min(Math.max(parsedCurrent, 0), tierCount - 1)

    if (tierCount === 0) return null

    // Clamp the controlled selection to the policy ladder so a stale parent
    // index doesn't crash `tiers[selectedIdx]` when the policy shrinks.
    const selectedIdx = Math.min(Math.max(selectedTierIdx, 0), tierCount - 1)
    const tierPolicy = tiers[selectedIdx]
    const inflowUnlimited = !!tierPolicy && isUnlimitedCap(tierPolicy.inflowCapEurMinor)
    const outflowUnlimited = !!tierPolicy && isUnlimitedCap(tierPolicy.outflowCapEurMinor)
    const requirements = gatesFromBitmask(tierPolicy.requiredGates).map((gate) => ({
        gate,
        ...GATE_DISPLAY[gate],
    }))
    const unknownRequirementBits = unknownGateBits(tierPolicy.requiredGates)

    const positionLabel = selectedIdx < currentIdx
        ? 'Achieved'
        : selectedIdx === currentIdx
            ? 'Your tier'
            : 'Locked'

    const inflowCapLabel = tierPolicy
        ? (inflowUnlimited ? 'unlimited' : `up to € ${formatEurMinor(tierPolicy.inflowCapEurMinor)}`)
        : '—'
    const outflowCapLabel = tierPolicy
        ? (outflowUnlimited ? 'unlimited' : `up to € ${formatEurMinor(tierPolicy.outflowCapEurMinor)}`)
        : '—'

    const showVerifyCta = selectedIdx > currentIdx
    const badgeTier = `T${selectedIdx}` as PlayerTier

    // "Needed for next tier" checklist — only meaningful while the player is
    // looking at their own tier and gates are still missing for the one above.
    const missingForNext = nextTier && selectedIdx === currentIdx
        ? gatesFromBitmask(nextTier.missingGates).map((gate) => ({ gate, ...GATE_DISPLAY[gate] }))
        : []
    const unknownMissingBits = nextTier && selectedIdx === currentIdx
        ? unknownGateBits(nextTier.missingGates)
        : []

    return (
        <VStack className={cn('gap-4', className)}>
            <Tabs value={String(selectedIdx)} onValueChange={(v) => onSelectedTierChange(Number(v))}>
                <TabsList className='w-full h-10'>
                    {tiers.map((_, idx) => (
                        <TabsTrigger key={idx} value={String(idx)} className='uppercase tracking-wide text-xs'>
                            Tier {idx}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <VStack className='gap-3 rounded-md ring-1 ring-border bg-background/40 p-4 min-h-[180px]'>
                <HStack className='items-center justify-between gap-3'>
                    <HStack className='items-center gap-3'>
                        <TierBadge tier={badgeTier} size='md' />
                        <span className='text-xs uppercase tracking-wide text-secondary-foreground'>
                            {positionLabel}
                        </span>
                    </HStack>
                    <VStack className='items-end gap-0.5'>
                        <span className='text-xs font-mono text-secondary-foreground'>
                            <span className='uppercase mr-1'>Wager in</span>{inflowCapLabel}
                        </span>
                        <span className='text-xs font-mono text-secondary-foreground'>
                            <span className='uppercase mr-1'>Claim out</span>{outflowCapLabel}
                        </span>
                    </VStack>
                </HStack>

                {requirements.length === 0 && unknownRequirementBits.length === 0
                    ? <span className='text-sm text-secondary-foreground'>No verification required.</span>
                    : (
                        <VStack className='gap-2'>
                            {requirements.map((req) => (
                                <RequirementRow
                                    key={req.gate}
                                    label={req.label}
                                    description={req.description}
                                    status={rowStatus(req.gate, gates?.[req.gate], onChainGates)}
                                />
                            ))}
                            {unknownRequirementBits.map((bit) => (
                                <RequirementRow
                                    key={`unknown-${bit}`}
                                    label={UNKNOWN_GATE_DISPLAY.label}
                                    description={UNKNOWN_GATE_DISPLAY.description}
                                    status={unknownBitStatus(bit, onChainGates)}
                                />
                            ))}
                        </VStack>
                    )}

                {(missingForNext.length > 0 || unknownMissingBits.length > 0) && nextTier && (
                    <VStack className='gap-2 border-t border-border pt-3'>
                        <span className='text-xs uppercase tracking-wide text-secondary-foreground'>
                            Needed for {nextTier.tier}
                        </span>
                        {missingForNext.map((req) => (
                            <RequirementRow
                                key={req.gate}
                                label={req.label}
                                description={req.description}
                                status={rowStatus(req.gate, gates?.[req.gate], onChainGates)}
                            />
                        ))}
                        {unknownMissingBits.map((bit) => (
                            <RequirementRow
                                key={`unknown-${bit}`}
                                label={UNKNOWN_GATE_DISPLAY.label}
                                description={UNKNOWN_GATE_DISPLAY.description}
                                status={unknownBitStatus(bit, onChainGates)}
                            />
                        ))}
                        <HStack className='justify-end pt-1'>
                            <Button size='sm' variant='default' onClick={onVerify}>
                                Start verification
                            </Button>
                        </HStack>
                    </VStack>
                )}

                {showVerifyCta && (
                    <HStack className='justify-end pt-1'>
                        <Button size='sm' variant='default' onClick={onVerify}>
                            Start verification
                        </Button>
                    </HStack>
                )}
            </VStack>
        </VStack>
    )
}
