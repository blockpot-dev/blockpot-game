import { usePrevious } from '@/hooks/utilities/usePrevious'
import { useTimeout } from '@/hooks/utilities/useTimeout'
import { InterfaceStatus } from '@/types/ui/interface-status'
import { Button } from '@blockpot-dev/blockpot-design-system'
import { CheckIcon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export type RegistrationMode = {
    register: () => void
    isSigning: boolean
    isPending: boolean
    isFailed: boolean
    disabled: boolean
    // Shown inline under the button when disabled or after a failure.
    disabledReason?: string
    // Optional overrides for labels. Used by the pre-deposit attestation
    // fallback to surface "ACCEPT TERMS" instead of "REGISTER TO ENTER".
    idleLabel?: string
    signingLabel?: string
}

export type EntryButtonProps = {
    enter: () => void
    status: InterfaceStatus
    canEnter: boolean
    disabledReason?: string
    // Optional action rendered after the reason (e.g. a support link).
    disabledReasonAction?: React.ReactNode
    registration?: RegistrationMode
}

function DisabledReason({ reason, action }: { reason: string, action?: React.ReactNode }) {
    return (
        <p role='status' className='mt-2 text-xs leading-snug text-secondary-foreground'>
            {reason}
            {action ? <> {action}</> : null}
        </p>
    )
}

export default function EntryButton(props: EntryButtonProps) {
    const { status, enter, canEnter, disabledReason, disabledReasonAction, registration } = props
    const [showSuccess, setShowSuccess] = useState(false)
    const { start } = useTimeout(() => {
        setShowSuccess(false)
    }, 3000)
    const isEntering = status === 'pending'
    const previousStatus = usePrevious(status)
    const triggerSuccess = previousStatus === 'pending' && status === 'success'

    useEffect(() => {
        if (triggerSuccess) {
            setShowSuccess(true)
            start()
        }
    }, [triggerSuccess, start])

    if (registration) {
        const { register, isSigning, isPending, isFailed, disabled, disabledReason: regReason, idleLabel = 'REGISTER TO ENTER', signingLabel = 'CONFIRM IN WALLET…' } = registration
        const busy = isSigning || isPending
        let label: React.ReactNode = idleLabel
        if (isSigning) label = <><Loader2 className='mr-2 h-4 w-4 animate-spin' /><span>{signingLabel}</span></>
        else if (isPending) label = <><Loader2 className='mr-2 h-4 w-4 animate-spin' /><span>REGISTERING…</span></>
        else if (isFailed) label = 'RETRY REGISTRATION'

        const showReason = (disabled || isFailed) && !busy && regReason
        return (
            <span className='block w-full' title={showReason ? regReason : undefined}>
                <Button
                    className='w-full'
                    onClick={register}
                    disabled={busy || disabled}
                    variant='default'
                >
                    {label}
                </Button>
                {showReason && <DisabledReason reason={regReason} />}
            </span>
        )
    }

    const showReason = !canEnter && !isEntering && disabledReason
    return (
        <span className='block w-full' title={showReason ? disabledReason : undefined}>
            <Button className='w-full' onClick={enter} disabled={!canEnter || isEntering} variant={showSuccess ? 'positive' : 'default'} disableInteraction={showSuccess}>
                {
                    showSuccess ? <>
                        <CheckIcon className='size-6' />
                        <span className='uppercase'>{' ENTERED'}</span>
                    </>
                        : (
                            isEntering
                                ? <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    <span>ENTERING…</span>
                                </>
                                : 'ENTER DRAW'
                        )
                }
            </Button>
            {showReason && <DisabledReason reason={disabledReason} action={disabledReasonAction} />}
        </span>
    )
}
