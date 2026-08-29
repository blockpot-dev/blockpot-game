import { useEffect, useState } from 'react'
import { Button, Input } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useRealityCheck, { RealityCheckConfig } from '@/hooks/responsible-gaming/useRealityCheck'
import {
    REALITY_CHECK_MAX_MINUTES,
    REALITY_CHECK_MIN_MINUTES,
} from '@/constants/responsibleGaming'

export type RealityCheckSettingsViewProps = {
    walletConnected: boolean
    config: RealityCheckConfig
    onSetInterval: (minutes: number) => void
    onSetEnabled: (enabled: boolean) => void
}

export function RealityCheckSettingsView({
    walletConnected,
    config,
    onSetInterval,
    onSetEnabled,
}: RealityCheckSettingsViewProps) {
    const [draft, setDraft] = useState(String(config.intervalMinutes))
    const [rangeError, setRangeError] = useState(false)
    useEffect(() => {
        setDraft(String(config.intervalMinutes))
        setRangeError(false)
    }, [config.intervalMinutes])

    const save = () => {
        const minutes = Number(draft)
        if (!Number.isInteger(minutes) || minutes < REALITY_CHECK_MIN_MINUTES || minutes > REALITY_CHECK_MAX_MINUTES) {
            setRangeError(true)
            return
        }
        setRangeError(false)
        onSetInterval(minutes)
    }

    if (!walletConnected) {
        return (
            <Section>
                <p className='text-sm text-secondary-foreground'>
                    Connect your wallet and sign in to set your reality check.
                </p>
            </Section>
        )
    }

    return (
        <Section>
            <p className='text-sm text-secondary-foreground'>
                While you play, we show how long your session has lasted and your net spend at
                the interval you choose. The reminder is stored on this device only and never
                blocks your entries.
            </p>
            <HStack className='gap-3 items-end flex-wrap'>
                <VStack className='gap-1'>
                    <label htmlFor='reality-check-interval' className='text-xs text-secondary-foreground'>
                        Remind me every … minutes ({REALITY_CHECK_MIN_MINUTES} to {REALITY_CHECK_MAX_MINUTES})
                    </label>
                    <Input
                        id='reality-check-interval'
                        type='number'
                        min={REALITY_CHECK_MIN_MINUTES}
                        max={REALITY_CHECK_MAX_MINUTES}
                        value={draft}
                        disabled={!config.enabled}
                        onChange={(e) => { setDraft(e.target.value); setRangeError(false) }}
                        aria-invalid={rangeError || undefined}
                        aria-describedby={rangeError ? 'reality-check-interval-error' : undefined}
                        className='w-40'
                    />
                </VStack>
                <Button
                    variant='outline'
                    disabled={!config.enabled || Number(draft) === config.intervalMinutes}
                    onClick={save}
                >
                    SAVE REMINDER
                </Button>
                <Button
                    variant={config.enabled ? 'outline' : 'default'}
                    onClick={() => onSetEnabled(!config.enabled)}
                >
                    {config.enabled ? 'TURN REMINDER OFF' : 'TURN REMINDER ON'}
                </Button>
            </HStack>
            {rangeError && (
                <p id='reality-check-interval-error' className='text-xs text-destructive font-body'>
                    Choose between {REALITY_CHECK_MIN_MINUTES} and {REALITY_CHECK_MAX_MINUTES} minutes.
                </p>
            )}
            {!config.enabled && (
                <p className='text-xs text-secondary-foreground font-body'>
                    Your reminder is off. We recommend keeping it on while you play.
                </p>
            )}
        </Section>
    )
}

// Player-configurable reality-check settings (task 113): interval + on/off,
// persisted client-only via useRealityCheck (localStorage) — no backend call.
export default function RealityCheckSettings({ walletConnected }: { walletConnected: boolean }) {
    const address = useAccountAddress()
    const { config, setInterval, setEnabled } = useRealityCheck(address)
    return (
        <RealityCheckSettingsView
            walletConnected={walletConnected}
            config={config}
            onSetInterval={setInterval}
            onSetEnabled={setEnabled}
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
