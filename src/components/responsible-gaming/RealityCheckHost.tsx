import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useRealityCheck from '@/hooks/responsible-gaming/useRealityCheck'
import useSessionTimer from '@/hooks/responsible-gaming/useSessionTimer'
import { formatEurMinor } from './lossLimitCopy'
import { formatSessionDuration } from './realityCheckCopy'
import RealityCheckDialog from './RealityCheckDialog'

export type _RealityCheckHostProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    sessionDurationLabel: string
    netSpendLabel: string
    onContinue: () => void
    onStop: () => void
    onGetHelp: () => void
}

// Presentational half — the fired prompt. Split out so Storybook can show the
// fired state without the interval/hook machinery.
export function _RealityCheckHost(props: _RealityCheckHostProps) {
    return <RealityCheckDialog {...props} />
}

// Mounts under /play and fires the reality-check prompt every configured
// interval while enabled (task 113, client-only — no server state). The
// prompt is informational: Continue restarts the interval, Stop routes to
// /responsible-gaming. It never blocks entry.
export default function RealityCheckHost() {
    const navigate = useNavigate()
    const address = useAccountAddress()
    const { config } = useRealityCheck(address)
    const { elapsedMs, sessionNetSpendEurMinor } = useSessionTimer(address)

    const [open, setOpen] = useState(false)
    const lastPromptAtRef = useRef(Date.now())

    useEffect(() => {
        if (!config.enabled) return
        const id = window.setInterval(() => {
            if (Date.now() - lastPromptAtRef.current >= config.intervalMinutes * 60_000) {
                setOpen(true)
            }
        }, 1000)
        return () => window.clearInterval(id)
    }, [config.enabled, config.intervalMinutes])

    const dismiss = () => {
        lastPromptAtRef.current = Date.now()
        setOpen(false)
    }

    if (!config.enabled) return null

    return (
        <_RealityCheckHost
            open={open}
            onOpenChange={(next) => { if (!next) dismiss() }}
            sessionDurationLabel={formatSessionDuration(elapsedMs)}
            netSpendLabel={formatEurMinor(sessionNetSpendEurMinor)}
            onContinue={dismiss}
            onStop={() => {
                dismiss()
                void navigate({ to: '/responsible-gaming' })
            }}
            onGetHelp={() => {
                dismiss()
                void navigate({ to: '/responsible-gaming' })
            }}
        />
    )
}
