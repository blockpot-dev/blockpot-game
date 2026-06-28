import { useNavigate } from '@tanstack/react-router'
import {
    Button,
    Dialog,
    DialogContent,
    DialogTopSection,
} from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import { SessionSnapshot } from '@/hooks/responsible-gaming/useSessionTimer'

export type RealityCheckModalViewProps = {
    open: boolean
    elapsedMs: number
    wageredEurFormatted: string
    wonEurFormatted: string
    onContinue: () => void
    onTakeBreak: () => void
    onSelfExclude: () => void
}

const EUR_FORMAT = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
})

function formatEurMinor(value: bigint): string {
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) return EUR_FORMAT.format(Number.MAX_SAFE_INTEGER / 100)
    return EUR_FORMAT.format(Number(value) / 100)
}

function formatElapsed(ms: number): string {
    const totalMinutes = Math.max(0, Math.floor(ms / 60_000))
    if (totalMinutes < 1) return 'less than a minute'
    if (totalMinutes < 60) return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    if (mins === 0) return `${hours} hour${hours === 1 ? '' : 's'}`
    return `${hours}h ${mins}m`
}

export function RealityCheckModalView({
    open,
    elapsedMs,
    wageredEurFormatted,
    wonEurFormatted,
    onContinue,
    onTakeBreak,
    onSelfExclude,
}: RealityCheckModalViewProps) {
    const elapsedCopy = formatElapsed(elapsedMs)
    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onContinue() }}>
            <DialogContent
                data-slot='reality-check'
                className='sm:max-w-lg'
                showCloseButton={false}
            >
                <DialogTopSection title='Reality check' />
                <VStack className='gap-3 mb-4'>
                    <p className='text-sm text-foreground'>
                        You&apos;ve been playing for <strong>{elapsedCopy}</strong>.
                    </p>
                    <div className='grid grid-cols-2 gap-2'>
                        <Stat
                            label='Wagered this session'
                            valueFormatted={wageredEurFormatted}
                        />
                        <Stat
                            label='Won this session'
                            valueFormatted={wonEurFormatted}
                        />
                    </div>
                    <p className='text-xs text-secondary-foreground font-body'>
                        Take a break whenever you want. You can adjust your reality-check
                        interval, set loss limits, or self-exclude from the Responsible gaming page.
                    </p>
                </VStack>

                <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-between'>
                    <div className='flex flex-col gap-2 sm:flex-row'>
                        <Button variant='outline' onClick={onTakeBreak}>
                            TAKE A BREAK
                        </Button>
                        <Button variant='destructive' onClick={onSelfExclude}>
                            SELF-EXCLUDE
                        </Button>
                    </div>
                    <Button onClick={onContinue}>CONTINUE PLAYING</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export type RealityCheckModalProps = {
    open: boolean
    snapshot: SessionSnapshot | null
    onAcknowledge: () => void
    onEndSession: () => void
}

export default function RealityCheckModal({
    open,
    snapshot,
    onAcknowledge,
    onEndSession,
}: RealityCheckModalProps) {
    const navigate = useNavigate()
    const wageredEurMinor = snapshot?.wageredEurMinor ?? 0n
    const wonEurMinor = snapshot?.wonEurMinor ?? 0n

    return (
        <RealityCheckModalView
            open={open}
            elapsedMs={snapshot?.elapsedMs ?? 0}
            wageredEurFormatted={formatEurMinor(wageredEurMinor)}
            wonEurFormatted={formatEurMinor(wonEurMinor)}
            onContinue={onAcknowledge}
            onTakeBreak={() => {
                onEndSession()
                void navigate({ to: '/responsible-gaming' })
            }}
            onSelfExclude={() => {
                onEndSession()
                void navigate({ to: '/responsible-gaming' })
            }}
        />
    )
}

function Stat({
    label,
    valueFormatted,
}: {
    label: string
    valueFormatted: string
}) {
    return (
        <div className='rounded-md border border-border bg-background/40 px-3 py-2'>
            <div className='text-xs uppercase text-gray-400 tracking-wide'>{label}</div>
            <div className='mt-1 text-sm text-foreground'>{valueFormatted}</div>
        </div>
    )
}
