import { useAccount } from 'wagmi'
import useRealityCheck, {
    REALITY_CHECK_DEFAULT_MINUTES,
} from '@/hooks/responsible-gaming/useRealityCheck'
import useSessionTimer from '@/hooks/responsible-gaming/useSessionTimer'
import RealityCheckModal from './RealityCheckModal'

// Mounted on /play. Owns the session timer + reality-check modal lifecycle so
// the play surface itself stays focused on the entry form. The modal only ever
// fires when the player is connected and the operator-side config has the
// feature enabled.
export default function RealityCheckHost() {
    const { isConnected } = useAccount()
    const { config } = useRealityCheck()

    const featureEnabled = isConnected && (config?.enabled ?? true)
    const intervalMinutes = config?.intervalMinutes ?? REALITY_CHECK_DEFAULT_MINUTES

    const { snapshot, dueForReminder, acknowledge, endSession } = useSessionTimer({
        enabled: featureEnabled,
        intervalMinutes,
    })

    return (
        <RealityCheckModal
            open={dueForReminder}
            snapshot={snapshot}
            onAcknowledge={acknowledge}
            onEndSession={endSession}
        />
    )
}
