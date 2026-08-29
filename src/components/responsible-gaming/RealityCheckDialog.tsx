import { Button, Dialog, DialogContent, DialogFooter, DialogTopSection } from '@blockpot-dev/blockpot-design-system'

export type RealityCheckDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Formatted session duration, e.g. "1 hour 12 minutes". */
    sessionDurationLabel: string
    /** Formatted session net spend, e.g. "€24.50". */
    netSpendLabel: string
    onContinue: () => void
    onStop: () => void
    /** Optional: renders a "Support and resources" link routing to the support page. */
    onGetHelp?: () => void
}

// Presentational reality-check prompt (B-RG-3, task 113). Lives in the game
// (not the design system) by product decision — it is product-specific; only
// cross-project elements belong in the shared package. Built on the design
// system's Dialog primitives; the host owns scheduling and what
// Continue/Stop do. Informational only — never blocks play.
export default function RealityCheckDialog({
    open,
    onOpenChange,
    sessionDurationLabel,
    netSpendLabel,
    onContinue,
    onStop,
    onGetHelp,
}: RealityCheckDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent data-slot='reality-check-dialog'>
                <DialogTopSection title='Reality check' />
                <div className='flex flex-col gap-3 mb-4'>
                    <div className='flex items-baseline justify-between gap-4'>
                        <span className='text-sm text-secondary-foreground'>You have been playing for</span>
                        <span className='text-sm font-semibold text-right'>{sessionDurationLabel}</span>
                    </div>
                    <div className='flex items-baseline justify-between gap-4'>
                        <span className='text-sm text-secondary-foreground'>Net spend this session</span>
                        <span className='text-sm font-semibold text-right'>{netSpendLabel}</span>
                    </div>
                </div>
                {onGetHelp && (
                    <button
                        type='button'
                        onClick={onGetHelp}
                        className='self-start text-sm underline underline-offset-2 text-secondary-foreground hover:text-foreground mb-4'
                    >
                        Support and resources
                    </button>
                )}
                <DialogFooter>
                    <Button variant='outline' onClick={onContinue}>CONTINUE PLAYING</Button>
                    <Button variant='destructive' onClick={onStop}>STOP FOR NOW</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
