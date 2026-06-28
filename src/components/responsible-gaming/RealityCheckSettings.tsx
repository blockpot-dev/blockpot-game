import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button, InfoBanner, Input } from '@blockpot-dev/blockpot-design-system'
import { Checkbox } from '@/components/ui/checkbox'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import { ApiError } from '@/api/gamingServiceClient'
import useRealityCheck, {
    RealityCheckConfig,
    REALITY_CHECK_DEFAULT_MINUTES,
    REALITY_CHECK_MAX_MINUTES,
    REALITY_CHECK_MIN_MINUTES,
    UpdateRealityCheckPayload,
    useUpdateRealityCheck,
} from '@/hooks/responsible-gaming/useRealityCheck'

export type RealityCheckSettingsViewProps = {
    walletConnected: boolean
    config: RealityCheckConfig | undefined
    isLoading?: boolean
    onSave: (payload: UpdateRealityCheckPayload) => void
    submitting?: boolean
    submitError?: string
}

export function RealityCheckSettingsView({
    walletConnected,
    config,
    isLoading = false,
    onSave,
    submitting = false,
    submitError,
}: RealityCheckSettingsViewProps) {
    const [enabled, setEnabled] = useState<boolean>(config?.enabled ?? true)
    const [intervalDraft, setIntervalDraft] = useState<string>(
        String(config?.intervalMinutes ?? REALITY_CHECK_DEFAULT_MINUTES),
    )
    const [attempted, setAttempted] = useState(false)

    useEffect(() => {
        if (!config) return
        setEnabled(config.enabled)
        setIntervalDraft(String(config.intervalMinutes))
    }, [config])

    if (!walletConnected) {
        return (
            <Section>
                <p className='text-sm text-secondary-foreground'>
                    Connect your wallet and sign in to configure reality-check reminders.
                </p>
            </Section>
        )
    }
    if (isLoading || !config) {
        return (
            <Section>
                <p className='text-sm text-secondary-foreground'>Loading…</p>
            </Section>
        )
    }

    const intervalNum = Number(intervalDraft)
    const intervalValid =
        Number.isFinite(intervalNum)
        && Number.isInteger(intervalNum)
        && intervalNum >= REALITY_CHECK_MIN_MINUTES
        && intervalNum <= REALITY_CHECK_MAX_MINUTES

    const intervalError = attempted && !intervalValid
        ? `Enter a whole number of minutes between ${REALITY_CHECK_MIN_MINUTES} and ${REALITY_CHECK_MAX_MINUTES}.`
        : undefined

    const dirty =
        enabled !== config.enabled
        || intervalNum !== config.intervalMinutes

    const handleSave = () => {
        setAttempted(true)
        if (!intervalValid) return
        onSave({ enabled, intervalMinutes: intervalNum })
    }

    return (
        <Section>
            <p className='text-sm text-secondary-foreground'>
                A reality check reminds you periodically while you play. The modal pauses the
                page and shows time spent and net activity, with the option to keep playing,
                take a break, or self-exclude.
            </p>
            <p className='text-xs text-secondary-foreground font-body'>
                The minimum interval is {REALITY_CHECK_MIN_MINUTES} minutes — this is a
                regulator-required guardrail and cannot be reduced further.
            </p>

            <VStack className='gap-3 mt-2'>
                <HStack className='items-center gap-2'>
                    <Checkbox
                        id='rc-enabled'
                        checked={enabled}
                        onCheckedChange={(value) => setEnabled(value === true)}
                    />
                    <label htmlFor='rc-enabled' className='text-sm text-foreground cursor-pointer'>
                        Enable reality-check reminders
                    </label>
                </HStack>

                <div>
                    <label className='text-xs uppercase text-gray-400 tracking-wide'>
                        Interval (minutes)
                    </label>
                    <Input
                        type='number'
                        inputMode='numeric'
                        min={REALITY_CHECK_MIN_MINUTES}
                        max={REALITY_CHECK_MAX_MINUTES}
                        step={1}
                        value={intervalDraft}
                        onChange={(e) => setIntervalDraft(e.target.value)}
                        disabled={!enabled}
                        className='mt-1.5 max-w-[180px]'
                    />
                    {intervalError && (
                        <p role='alert' className='text-xs text-destructive mt-1.5'>
                            {intervalError}
                        </p>
                    )}
                </div>

                {submitError && (
                    <InfoBanner tone='block'>{submitError}</InfoBanner>
                )}

                <div className='flex justify-end'>
                    <Button onClick={handleSave} disabled={submitting || !dirty}>
                        {submitting
                            ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /><span>SAVING…</span></>
                            : 'SAVE'}
                    </Button>
                </div>
            </VStack>
        </Section>
    )
}

export type RealityCheckSettingsProps = {
    walletConnected: boolean
}

export default function RealityCheckSettings({ walletConnected }: RealityCheckSettingsProps) {
    const { config, isLoading } = useRealityCheck()
    const update = useUpdateRealityCheck()

    const submitError = update.isError
        ? update.error instanceof ApiError
            ? update.error.message
            : update.error instanceof Error
                ? update.error.message
                : 'Could not save reality-check settings'
        : undefined

    return (
        <RealityCheckSettingsView
            walletConnected={walletConnected}
            config={config}
            isLoading={isLoading}
            submitting={update.isPending}
            submitError={submitError}
            onSave={(payload) => update.mutate(payload, { onSuccess: () => update.reset() })}
        />
    )
}

function Section({ children }: { children: React.ReactNode }) {
    return (
        <VStack className='gap-3'>
            <h2 className='text-xl font-semibold text-foreground'>Reality check</h2>
            {children}
        </VStack>
    )
}
