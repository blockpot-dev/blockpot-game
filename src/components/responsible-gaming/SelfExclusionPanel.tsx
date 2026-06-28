import { useState } from 'react'
import {
    AttestationCheckbox,
    Button,
    InfoBanner,
} from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import { ApiError } from '@/api/gamingServiceClient'
import useSelfExclusion, {
    SelfExclusionDuration,
    SelfExclusionRecord,
} from '@/hooks/responsible-gaming/useSelfExclusion'
import useApplySelfExclusion, {
    ApplySelfExclusionPayload,
} from '@/hooks/responsible-gaming/useApplySelfExclusion'
import {
    DURATION_OPTIONS,
    durationLabel,
    formatEndsAt,
} from './selfExclusionCopy'
import SelfExclusionConfirmDialog from './SelfExclusionConfirmDialog'

export type SelfExclusionPanelViewProps = {
    walletConnected: boolean
    active: SelfExclusionRecord | null
    isLoading?: boolean
    onApply: (payload: ApplySelfExclusionPayload) => void
    submitting?: boolean
    submitError?: string
    onApplied?: () => void
}

const MAX_REASON_LEN = 500

export function SelfExclusionPanelView({
    walletConnected,
    active,
    isLoading = false,
    onApply,
    submitting = false,
    submitError,
}: SelfExclusionPanelViewProps) {
    const [duration, setDuration] = useState<SelfExclusionDuration>('7d')
    const [reason, setReason] = useState('')
    const [understood, setUnderstood] = useState(false)
    const [attempted, setAttempted] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)

    if (!walletConnected) {
        return (
            <Section title='Self-exclusion'>
                <p className='text-sm text-secondary-foreground'>
                    Connect your wallet and sign in to manage self-exclusion.
                </p>
            </Section>
        )
    }

    if (isLoading) {
        return (
            <Section title='Self-exclusion'>
                <p className='text-sm text-secondary-foreground'>Loading…</p>
            </Section>
        )
    }

    if (active) {
        return <ActiveExclusion record={active} />
    }

    const understoodError = attempted && !understood ? 'Confirm you understand the action' : undefined

    const handleSubmit = () => {
        setAttempted(true)
        if (!understood) return
        setConfirmOpen(true)
    }

    const handleConfirm = () => {
        onApply({
            duration,
            reason: reason.trim() ? reason.trim() : undefined,
        })
    }

    return (
        <Section title='Self-exclusion'>
            <p className='text-sm text-secondary-foreground'>
                Take a break from Blockpot. Self-exclusion is enforced by our pre-transaction
                gate — you cannot enter the lottery until it ends. You can still claim any
                escrowed winnings during this period.
            </p>

            <VStack className='gap-3 mt-2'>
                <fieldset>
                    <legend className='text-xs uppercase text-gray-400 tracking-wide mb-2'>
                        Duration
                    </legend>
                    <div className='grid gap-2'>
                        {DURATION_OPTIONS.map((opt) => (
                            <RadioRow
                                key={opt.value}
                                name='se-duration'
                                value={opt.value}
                                checked={duration === opt.value}
                                onChange={() => setDuration(opt.value)}
                                label={opt.label}
                                helper={opt.helper}
                            />
                        ))}
                    </div>
                </fieldset>

                <div>
                    <label className='text-xs uppercase text-gray-400 tracking-wide'>
                        Reason (optional)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON_LEN))}
                        placeholder='Anything you would like our compliance team to know.'
                        className='mt-1.5 w-full min-h-20 rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm font-body'
                    />
                    <div className='mt-1 flex items-center justify-end text-xs text-gray-500'>
                        <span>{reason.length}/{MAX_REASON_LEN}</span>
                    </div>
                </div>

                <AttestationCheckbox
                    checked={understood}
                    onCheckedChange={setUnderstood}
                    label='I understand that this exclusion cannot be cancelled or shortened. Permanent exclusions can only be lifted by Blockpot compliance.'
                    error={understoodError}
                    required
                />

                {submitError && (
                    <InfoBanner tone='block'>{submitError}</InfoBanner>
                )}

                <div className='flex justify-end'>
                    <Button
                        variant='destructive'
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        REVIEW SELF-EXCLUSION
                    </Button>
                </div>
            </VStack>

            <SelfExclusionConfirmDialog
                open={confirmOpen}
                onOpenChange={(open) => {
                    if (submitting) return
                    setConfirmOpen(open)
                }}
                duration={duration}
                onConfirm={handleConfirm}
                submitting={submitting}
                error={submitError}
            />
        </Section>
    )
}

export type SelfExclusionPanelProps = {
    walletConnected: boolean
}

export default function SelfExclusionPanel({ walletConnected }: SelfExclusionPanelProps) {
    const { active, isLoading } = useSelfExclusion()
    const apply = useApplySelfExclusion()

    const submitError = apply.isError
        ? apply.error instanceof ApiError
            ? apply.error.message
            : apply.error instanceof Error
                ? apply.error.message
                : 'Could not apply self-exclusion'
        : undefined

    return (
        <SelfExclusionPanelView
            walletConnected={walletConnected}
            active={active}
            isLoading={isLoading}
            submitting={apply.isPending}
            submitError={submitError}
            onApply={(payload) => {
                apply.mutate(payload, { onSuccess: () => apply.reset() })
            }}
        />
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <VStack className='gap-3'>
            <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
            {children}
        </VStack>
    )
}

function RadioRow({
    name,
    value,
    checked,
    onChange,
    label,
    helper,
}: {
    name: string
    value: string
    checked: boolean
    onChange: () => void
    label: string
    helper: string
}) {
    const id = `${name}-${value}`
    return (
        <label
            htmlFor={id}
            className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 transition-colors ${
                checked
                    ? 'border-foreground bg-foreground/10'
                    : 'border-border bg-background/40 hover:border-foreground/60'
            }`}
        >
            <input
                id={id}
                type='radio'
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className='mt-1 h-4 w-4 accent-foreground'
            />
            <div className='flex flex-col'>
                <span className='text-sm text-foreground'>{label}</span>
                <span className='text-xs text-secondary-foreground font-body'>{helper}</span>
            </div>
        </label>
    )
}

function ActiveExclusion({ record }: { record: SelfExclusionRecord }) {
    const isPermanent = record.duration === 'permanent' || !record.endsAt
    return (
        <Section title='Self-exclusion'>
            <InfoBanner tone='block'>
                <div className='flex flex-col gap-1'>
                    <strong>
                        Self-exclusion active — {durationLabel(record.duration)}
                    </strong>
                    <span className='text-xs'>
                        {isPermanent
                            ? 'Permanent. Contact compliance to request a review.'
                            : `Ends ${formatEndsAt(record.endsAt)}`}
                    </span>
                    {record.appliedBy === 'mlro' && (
                        <span className='text-xs'>Applied by Blockpot compliance.</span>
                    )}
                </div>
            </InfoBanner>
            <p className='text-sm text-secondary-foreground font-body'>
                You cannot enter the lottery while this exclusion is active. You can still
                claim any escrowed winnings. Need to talk to someone? See the resources below.
            </p>
        </Section>
    )
}
