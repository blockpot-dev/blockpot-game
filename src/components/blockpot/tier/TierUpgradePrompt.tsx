import { Button, InfoBanner } from '@blockpot-dev/blockpot-design-system'
import { useState } from 'react'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

export type TierUpgradePromptProps = {
    state: PlayerActivityState | undefined
    onVerify: () => void
    className?: string
}

// KB `business-plan/compliance-kyc` "The proximity nudge": one dismissible
// prompt at 90% of the current cap, no persistent indicator, no toasts.
export const PROXIMITY_NUDGE_RATIO = 0.9
export const PROXIMITY_NUDGE_DISMISSED_KEY = 'blockpot.proximityNudgeDismissed'

function readDismissed(): boolean {
    try {
        return window.sessionStorage.getItem(PROXIMITY_NUDGE_DISMISSED_KEY) === '1'
    } catch {
        return false
    }
}

function writeDismissed(): void {
    try {
        window.sessionStorage.setItem(PROXIMITY_NUDGE_DISMISSED_KEY, '1')
    } catch {
        // Storage unavailable (private mode, quota) — the banner still hides
        // for this render tree; it may reappear on reload, which is acceptable.
    }
}

// Unlimited sides carry ratio 0 by construction (usePlayerActivityState),
// so a top-tier player never sees the nudge.
export function isNearLimit(state: PlayerActivityState | undefined): boolean {
    if (!state) return false
    return Math.max(state.inflow.ratio, state.outflow.ratio) >= PROXIMITY_NUDGE_RATIO
}

export default function TierUpgradePrompt({ state, onVerify, className }: TierUpgradePromptProps) {
    const [dismissed, setDismissed] = useState<boolean>(readDismissed)

    if (dismissed || !isNearLimit(state)) return null

    const dismiss = () => {
        writeDismissed()
        setDismissed(true)
    }

    return (
        <InfoBanner
            tone='warn'
            className={className}
            dismissible
            onDismiss={dismiss}
            action={
                <Button size='sm' variant='default' onClick={onVerify}>
                    Verify now
                </Button>
            }
        >
            You&apos;re close to a limit that needs verification. Verify now to keep playing.
        </InfoBanner>
    )
}
