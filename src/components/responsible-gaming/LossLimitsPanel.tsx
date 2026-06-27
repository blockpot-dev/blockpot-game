import { useMemo, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button, InfoBanner, Input } from '@blockpot-dev/block-pot-design-system'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import { ApiError } from '@/api/gamingServiceClient'
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

export type LossLimitsPanelViewProps = {
    walletConnected: boolean
    state: LossLimitsState | undefined
    isLoading?: boolean
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
    if (isLoading || !state) {
        return (
            <Section>
                <p className='text-sm text-secondary-foreground'>Loading…</p>
            </Section>
        )
    }
    return (
        <Section>
            <p className='text-sm text-secondary-foreground'>
                Your loss limit caps the difference between what you stake and what you win
                back over the period. Wins reduce the consumed amount within the same window.
                Limits reset at 00:00 UTC.
            </p>
            <p className='text-xs text-secondary-foreground font-body'>
                <strong>Decreases and first-time limits</strong> take effect immediately.{' '}
                <strong>Increases</strong> require a 24-hour cool-down before they apply.
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
    const { state, isLoading } = useLossLimits()
    const setLimit = useSetLossLimit()
    const cancel = useCancelPendingLossLimit()

    const submitError = setLimit.isError
        ? setLimit.error instanceof ApiError
            ? setLimit.error.message
            : setLimit.error instanceof Error
                ? setLimit.error.message
                : 'Could not save loss limit'
        : undefined

    const cancelError = cancel.isError
        ? cancel.error instanceof ApiError
            ? cancel.error.message
            : cancel.error instanceof Error
                ? cancel.error.message
                : 'Could not cancel pending change'
        : undefined

    return (
        <LossLimitsPanelView
            walletConnected={walletConnected}
            state={state}
            isLoading={isLoading}
            submitting={setLimit.isPending}
            submitError={submitError}
            cancellingId={cancel.isPending ? cancel.variables ?? null : null}
            cancelError={cancelError}
            onSet={(payload) => setLimit.mutate(payload, { onSuccess: () => setLimit.reset() })}
            onCancelPending={(id) => cancel.mutate(id, { onSuccess: () => cancel.reset() })}
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
            return isInvalid ? 'Enter a valid amount in EUR (e.g. 100.00).' : null
        }
        if (direction === 'unchanged') return null
        if (direction === 'immediate') {
            return currentMinor === undefined
                ? 'Will apply immediately.'
                : `Decrease — applies immediately. New cap ${formatEurMinor(newAmountMinor as number)}.`
        }
        return 'Increase — takes effect 24 hours after submission.'
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
                    Pending change to {formatEurMinor(pending.newAmountEurMinor)} —
                    {' '}effective {formatEffectiveAt(pending.effectiveAt)}.
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
                        className='mt-1.5'
                    />
                </div>
                <Button
                    onClick={submit}
                    disabled={submitting || direction === 'unchanged' || direction === 'invalid'}
                >
                    {submitting
                        ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /><span>SAVING…</span></>
                        : 'SAVE'}
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
                    {PERIOD_LABELS[pending.period]} → {formatEurMinor(pending.newAmountEurMinor)}{' '}
                    <span className='text-xs text-secondary-foreground'>({pending.direction})</span>
                </span>
                <span className='text-xs text-secondary-foreground font-body'>
                    Effective {formatEffectiveAt(pending.effectiveAt)}
                </span>
            </div>
            <Button
                variant='outline'
                size='sm'
                onClick={onCancel}
                disabled={cancelling}
                aria-label='Cancel pending change'
            >
                {cancelling
                    ? <Loader2 className='h-4 w-4 animate-spin' />
                    : <><X className='h-4 w-4 mr-1' /><span>CANCEL</span></>}
            </Button>
        </HStack>
    )
}
