import { Button } from '@blockpot-dev/blockpot-design-system'
import { CheckCircle2, Loader2, Lock } from 'lucide-react'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import type { GateRecord, GateType } from '@/hooks/player/usePlayerKyc'
import type { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'
import { GATE_BIT_POSITION, GATE_DISPLAY, gatesFromBitmask, unknownGateBits } from '@/lib/kyc/gateBitmask'
import { cn } from '@/lib/utils'

export type TierBreakdownProps = {
    // Gaming-service records — supply pending/expired/failed overlays only.
    // "passed" is read from `onChainGates` because the contract bitmap is the
    // cryptographically authoritative source; the service map can lag or
    // omit records the chain already knows about (esp. on devnet where bits
    // are seeded directly).
    gates: Partial<Record<GateType, GateRecord>> | undefined
    onChainGates: bigint
    // The verification step above the player's current one — `missingGates`
    // is the whole checklist. The tier identity itself is never rendered
    // (KB `blockpot/story-map` B-VIS-1/2).
    nextTier?: PlayerActivityState['nextTier']
    onVerify: () => void
    className?: string
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
// checklist honest — dropping them shows a falsely complete list.
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

// A single "Verification" checklist: the gates still missing for the next
// verification step, plus one CTA. No tier tabs, no ladder, no caps.
export default function TierBreakdown({ gates, onChainGates, nextTier, onVerify, className }: TierBreakdownProps) {
    const missing = nextTier
        ? gatesFromBitmask(nextTier.missingGates).map((gate) => ({ gate, ...GATE_DISPLAY[gate] }))
        : []
    const unknownMissingBits = nextTier ? unknownGateBits(nextTier.missingGates) : []
    const nothingMissing = missing.length === 0 && unknownMissingBits.length === 0

    return (
        <VStack className={cn('gap-3 rounded-md ring-1 ring-border bg-background/40 p-4', className)}>
            <span className='text-xs uppercase tracking-wide text-secondary-foreground'>Verification</span>

            {nothingMissing
                ? <span className='text-sm text-secondary-foreground'>No verification required.</span>
                : (
                    <VStack className='gap-2'>
                        {missing.map((req) => (
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
                                Verify now
                            </Button>
                        </HStack>
                    </VStack>
                )}
        </VStack>
    )
}
