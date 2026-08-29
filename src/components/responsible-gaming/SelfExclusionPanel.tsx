import { useState } from 'react'
import {
    AttestationCheckbox,
    Button,
    InfoBanner,
} from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import { ApiError } from '@/api/gamingServiceClient'
import { SUPPORT_URL } from '@/constants/support'
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
    estimateEndsAt,
    formatEndsAt,
} from './selfExclusionCopy'
import SelfExclusionConfirmDialog from './SelfExclusionConfirmDialog'

export type SelfExclusionPanelViewProps = {
    walletConnected: boolean
    active: SelfExclusionRecord | null
    isLoading?: boolean
    loadError?: boolean
    onRetry?: () => void
    onApply: (payload: ApplySelfExclusionPayload) => void
    submitting?: boolean
    submitError?: string
    justApplied?: boolean
}

const MAX_REASON_LEN = 500

export function SelfExclusionPanelView({
    walletConnected,
    active,
    isLoading = false,
    loadError = false,
    onRetry,
    onApply,
    submitting = false,
    submitError,
    justApplied = false,
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
                <p className='text-sm text-secondary-foreground'>Checking your self-exclusion status…</p>
            </Section>
        )
    }

    if (loadError) {
        return (
            <Section title='Self-exclusion'>
                <InfoBanner tone='block'>
                    <div className='flex flex-col gap-2'>
                        <span>We couldn&apos;t load your settings. Try again.</span>
                        {onRetry && (
                            <div>
                                <Button variant='outline' size='default' onClick={onRetry}>
                                    TRY AGAIN
                                </Button>
                            </div>
                        )}
                    </div>
                </InfoBanner>
            </Section>
        )
    }

    if (active) {
        return <ActiveExclusion record={active} justApplied={justApplied} />
    }

    const understoodError = attempted && !understood ? 'Tick the box to confirm you understand.' : undefined

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
                Self-exclusion pauses your entries for the period you choose. You won&apos;t be
                able to enter draws until it ends. You can still claim any prizes you&apos;re owed.
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
                        placeholder="Anything you'd like to tell us (optional)."
                        className='mt-1.5 w-full min-h-20 rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm font-body'
                    />
                    <div className='mt-1 flex items-center justify-end text-xs text-gray-500'>
                        <span>{reason.length}/{MAX_REASON_LEN}</span>
                    </div>
                </div>

                <AttestationCheckbox
                    checked={understood}
                    onCheckedChange={setUnderstood}
                    label="I understand this can't be cancelled or shortened once set. A permanent self-exclusion can only be lifted after a review by the Blockpot team."
                    error={understoodError}
                    required
                />

                {submitError && (
                    <InfoBanner tone='block'>
                        {submitError}{' '}
                        <a href={SUPPORT_URL} target='_blank' rel='noreferrer' className='underline'>
                            Contact support
                        </a>
                    </InfoBanner>
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
                endsAt={estimateEndsAt(duration)}
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
    const { active, isLoading, isError, refetch } = useSelfExclusion()
    const apply = useApplySelfExclusion()
    const [justApplied, setJustApplied] = useState(false)

    const submitError = apply.isError
        ? apply.error instanceof ApiError
            ? apply.error.message
            : apply.error instanceof Error
                ? apply.error.message
                : 'We couldn\'t set your self-exclusion. Please try again, or contact support.'
        : undefined

    return (
        <SelfExclusionPanelView
            walletConnected={walletConnected}
            active={active}
            isLoading={isLoading}
            loadError={isError}
            onRetry={() => { void refetch() }}
            submitting={apply.isPending}
            submitError={submitError}
            justApplied={justApplied}
            onApply={(payload) => {
                apply.mutate(payload, {
                    onSuccess: () => {
                        setJustApplied(true)
                        apply.reset()
                    },
                })
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

function ActiveExclusion({ record, justApplied = false }: { record: SelfExclusionRecord; justApplied?: boolean }) {
    const isPermanent = record.duration === 'permanent' || !record.endsAt
    return (
        <Section title='Self-exclusion'>
            {justApplied && (
                <p role='status' className='text-sm text-foreground'>Self-exclusion set.</p>
            )}
            <InfoBanner tone='block'>
                <div className='flex flex-col gap-1'>
                    <strong>
                        Self-exclusion active — {durationLabel(record.duration)}
                    </strong>
                    <span className='text-xs'>
                        {isPermanent
                            ? 'Permanent. To ask for a review, contact support (link below).'
                            : `Ends ${formatEndsAt(record.endsAt)}`}
                    </span>
                    {record.appliedBy === 'mlro' && (
                        <span className='text-xs'>Set by the Blockpot team.</span>
                    )}
                </div>
            </InfoBanner>
            <p className='text-sm text-secondary-foreground font-body'>
                You can&apos;t enter draws while this self-exclusion is active. You can still
                claim any prizes you&apos;re owed. Need to talk to someone? See the resources below,
                or <a href={SUPPORT_URL} target='_blank' rel='noreferrer' className='underline'>contact support</a>.
            </p>
        </Section>
    )
}
