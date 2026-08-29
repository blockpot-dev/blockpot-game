import { useMemo, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button, InfoBanner, Input } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import useLossLimits, {
    LossLimit,
    LossLimitPeriod,
    LossLimitsState,
    PendingLossLimit,
    SetLossLimitPayload,
    useCancelPendingLossLimit,
    useSetLossLimit,
} from '@/hooks/responsible-gaming/useLossLimits'
import {
    eurMinorToMajorString,
    formatEffectiveAt,
    formatEurMinor,
    parseEurMajorToMinor,
    PERIOD_HELPERS,
    PERIOD_LABELS,
    PERIODS,
} from './lossLimitCopy'

// Mirrors the service-side cool-down for increases; the server's effective_at
// is authoritative once the change is submitted.
const INCREASE_COOL_DOWN_MS = 24 * 60 * 60 * 1000

export type LossLimitsPanelViewProps = {
    walletConnected: boolean
    state: LossLimitsState | undefined
    isLoading?: boolean
    /** The limits query failed; renders retry copy instead of the form. */
    queryError?: boolean
    onRetry?: () => void
    /** Inline confirmation after a successful save or cancel. */
    successMessage?: string
    onSet: (payload: SetLossLimitPayload) => void
    onCancelPending: (id: string) => void
    submitting?: boolean
    submitError?: string
    cancellingId?: string | null
    cancelError?: string
}

export function LossLimitsPanelView({
    walletConnected,
    state,
    isLoading = false,
    queryError = false,
    onRetry,
    successMessage,
    onSet,
    onCancelPending,
    submitting = false,
    submitError,
    cancellingId,
    cancelError,
}: LossLimitsPanelViewProps) {
    if (!walletConnected) {
        return (
            <Section>
                <p className='text-sm text-secondary-foreground'>
                    Connect your wallet and sign in to set loss limits.
                </p>
            </Section>
        )
    }
    if (queryError) {
        return (
            <Section>
                <InfoBanner tone='block'>
                    <div className='flex flex-col gap-2 items-start'>
                        <span>We couldn't load your loss limits. Check your connection and try again.</span>
                        {onRetry && (
                            <Button variant='outline' size='sm' onClick={onRetry}>TRY AGAIN</Button>
                        )}
                    </div>
                </InfoBanner>
            </Section>
        )
    }
    if (isLoading || !state) {
        return (
            <Section>
                <p className='text-sm text-secondary-foreground' role='status'>Loading your loss limits…</p>
            </Section>
        )
    }
    return (
        <Section>
            <p className='text-sm text-secondary-foreground'>
                A loss limit caps how much you can lose over a day, week or month. Prizes you
                receive count back against it. Limits reset at midnight UTC.
            </p>
            <p className='text-xs text-secondary-foreground font-body'>
                Lowering a limit or setting your first one applies straight away. Raising a
                limit takes effect after 24 hours — you can cancel it any time before then.
            </p>
            <VStack className='gap-3 mt-2'>
                {PERIODS.map((period) => (
                    <PeriodRow
                        key={period}
                        period={period}
                        current={state[period]}
                        pending={state.pending.find((p) => p.period === period)}
                        onSet={onSet}
                        submitting={submitting}
                    />
                ))}
            </VStack>

            {successMessage && (
                <p role='status' className='text-sm text-foreground'>{successMessage}</p>
            )}
            {submitError && (
                <InfoBanner tone='block'>{submitError}</InfoBanner>
            )}

            {state.pending.length > 0 && (
                <VStack className='gap-2 mt-3'>
                    <h3 className='text-sm font-semibold text-foreground'>Pending changes</h3>
                    {state.pending.map((p) => (
                        <PendingRow
                            key={p.id}
                            pending={p}
                            onCancel={() => onCancelPending(p.id)}
                            cancelling={cancellingId === p.id}
                        />
                    ))}
                    {cancelError && (
                        <InfoBanner tone='block'>{cancelError}</InfoBanner>
                    )}
                </VStack>
            )}
        </Section>
    )
}

export type LossLimitsPanelProps = {
    walletConnected: boolean
}

export default function LossLimitsPanel({ walletConnected }: LossLimitsPanelProps) {
    const { state, isLoading, isError, refetch } = useLossLimits()
    const setLimit = useSetLossLimit()
    const cancel = useCancelPendingLossLimit()
    const [successMessage, setSuccessMessage] = useState<string | undefined>()

    // Raw ApiError / Error text never reaches the player (CLAUDE.md copy rules).
    const submitError = setLimit.isError
        ? 'We couldn\'t save your limit. Please try again.'
        : undefined
    const cancelError = cancel.isError
        ? 'We couldn\'t cancel that change. Please try again.'
        : undefined

    return (
        <LossLimitsPanelView
            walletConnected={walletConnected}
            state={state}
            isLoading={isLoading}
            queryError={isError}
            onRetry={() => void refetch()}
            successMessage={successMessage}
            submitting={setLimit.isPending}
            submitError={submitError}
            cancellingId={cancel.isPending ? cancel.variables ?? null : null}
            cancelError={cancelError}
            onSet={(payload) => {
                setSuccessMessage(undefined)
                setLimit.mutate(payload, {
                    onSuccess: (result) => {
                        setLimit.reset()
                        setSuccessMessage(
                            result.direction === 'pending'
                                ? `${PERIOD_LABELS[payload.period]} limit saved. It takes effect ${formatEffectiveAt(result.effectiveAt)}.`
                                : `${PERIOD_LABELS[payload.period]} limit saved.`,
                        )
                    },
                })
            }}
            onCancelPending={(id) => {
                setSuccessMessage(undefined)
                cancel.mutate(id, {
                    onSuccess: () => {
                        cancel.reset()
                        setSuccessMessage('Increase cancelled. Your current limit stays in place.')
                    },
                })
            }}
        />
    )
}

function Section({ children }: { children: React.ReactNode }) {
    return (
        <VStack className='gap-3'>
            <h2 className='text-xl font-semibold text-foreground'>Loss limits</h2>
            {children}
        </VStack>
    )
}

function PeriodRow({
    period,
    current,
    pending,
    onSet,
    submitting,
}: {
    period: LossLimitPeriod
    current: LossLimit | undefined
    pending: PendingLossLimit | undefined
    onSet: (payload: SetLossLimitPayload) => void
    submitting: boolean
}) {
    const [draft, setDraft] = useState(eurMinorToMajorString(current?.amountEurMinor))
    const [attempted, setAttempted] = useState(false)

    const newAmountMinor = parseEurMajorToMinor(draft)
    const currentMinor = current?.amountEurMinor

    const direction: 'immediate' | 'pending' | 'unchanged' | 'invalid' = useMemo(() => {
        if (newAmountMinor === null) return 'invalid'
        if (currentMinor === undefined) return 'immediate'
        if (newAmountMinor === currentMinor) return 'unchanged'
        return newAmountMinor < currentMinor ? 'immediate' : 'pending'
    }, [newAmountMinor, currentMinor])

    const isInvalid = attempted && direction === 'invalid'
    const helperCopy = (() => {
        if (direction === 'invalid') {
            return isInvalid ? 'Enter an amount in euros, e.g. 100.00.' : null
        }
        if (direction === 'unchanged') return null
        if (direction === 'immediate') {
            return `Applies straight away. Your ${PERIOD_LABELS[period].toLowerCase()} limit will be ${formatEurMinor(newAmountMinor as number)}.`
        }
        const effectiveAt = new Date(Date.now() + INCREASE_COOL_DOWN_MS).toISOString()
        return `Increase to ${formatEurMinor(newAmountMinor as number)} takes effect ${formatEffectiveAt(effectiveAt)}. You can cancel before then.`
    })()

    const submit = () => {
        setAttempted(true)
        if (direction === 'invalid' || direction === 'unchanged') return
        onSet({ period, amountEurMinor: newAmountMinor as number })
    }

    return (
        <div className='rounded-md border border-border bg-background/40 px-3 py-3'>
            <HStack className='items-baseline justify-between gap-3'>
                <div>
                    <div className='text-sm font-semibold text-foreground'>
                        {PERIOD_LABELS[period]} loss limit
                    </div>
                    <div className='text-xs text-secondary-foreground font-body'>
                        {PERIOD_HELPERS[period]}
                    </div>
                </div>
                <div className='text-xs text-secondary-foreground'>
                    {current ? `Current: ${formatEurMinor(current.amountEurMinor)}` : 'No limit set'}
                </div>
            </HStack>

            {pending && (
                <div className='mt-2 text-xs text-secondary-foreground'>
                    Pending: {pending.direction} to {formatEurMinor(pending.newAmountEurMinor)} ·
                    {' '}takes effect {formatEffectiveAt(pending.effectiveAt)}.
                </div>
            )}

            <HStack className='items-end gap-2 mt-3'>
                <div className='flex-1 min-w-0'>
                    <label className='text-xs uppercase text-gray-400 tracking-wide'>
                        New {PERIOD_LABELS[period].toLowerCase()} limit
                    </label>
                    <Input
                        type='number'
                        inputMode='decimal'
                        min='0'
                        step='0.01'
                        leadingAccessory='€'
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder='e.g. 100.00'
                        aria-label={`New ${PERIOD_LABELS[period].toLowerCase()} limit in euros`}
                        className='mt-1.5'
                    />
                </div>
                <Button
                    onClick={submit}
                    disabled={submitting || direction === 'unchanged' || direction === 'invalid'}
                >
                    {submitting
                        ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /><span>SAVING…</span></>
                        : 'SAVE LIMIT'}
                </Button>
            </HStack>
            {helperCopy && (
                <p className={`text-xs mt-2 font-body ${isInvalid ? 'text-destructive' : 'text-secondary-foreground'}`}>
                    {helperCopy}
                </p>
            )}
        </div>
    )
}

function PendingRow({
    pending,
    onCancel,
    cancelling,
}: {
    pending: PendingLossLimit
    onCancel: () => void
    cancelling: boolean
}) {
    return (
        <HStack className='items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-3 py-2'>
            <div className='flex flex-col'>
                <span className='text-sm text-foreground'>
                    {PERIOD_LABELS[pending.period]} limit: {pending.direction} to{' '}
                    {formatEurMinor(pending.newAmountEurMinor)} · takes effect {formatEffectiveAt(pending.effectiveAt)}
                </span>
            </div>
            <Button
                variant='outline'
                size='sm'
                onClick={onCancel}
                disabled={cancelling}
            >
                {cancelling
                    ? <Loader2 className='h-4 w-4 animate-spin' />
                    : <><X className='h-4 w-4 mr-1' /><span>{pending.direction === 'increase' ? 'CANCEL INCREASE' : 'CANCEL CHANGE'}</span></>}
            </Button>
        </HStack>
    )
}
