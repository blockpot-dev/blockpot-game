import { Loader2 } from 'lucide-react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogTopSection,
} from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import {
    SelfExclusionDuration,
} from '@/hooks/responsible-gaming/useSelfExclusion'
import { durationLabel } from './selfExclusionCopy'

export type SelfExclusionConfirmDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    duration: SelfExclusionDuration
    onConfirm: () => void
    submitting?: boolean
    error?: string
}

export default function SelfExclusionConfirmDialog({
    open,
    onOpenChange,
    duration,
    onConfirm,
    submitting = false,
    error,
}: SelfExclusionConfirmDialogProps) {
    const isPermanent = duration === 'permanent'
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                data-slot='self-exclusion-confirm'
                className='sm:max-w-lg'
                showCloseButton={!submitting}
            >
                <DialogTopSection title='Confirm self-exclusion' />
                <VStack className='gap-3 mb-4'>
                    <p className='text-sm text-foreground'>
                        You are about to self-exclude for{' '}
                        <strong>{durationLabel(duration)}</strong>.
                    </p>
                    <p className='text-sm text-secondary-foreground font-body'>
                        This action cannot be undone early. {isPermanent
                            ? 'Permanent exclusions can only be lifted after MLRO review.'
                            : duration === '6mo'
                                ? 'Six-month exclusions cannot be shortened — they only end at the scheduled time.'
                                : 'Shorter exclusions cannot be cancelled or shortened once set.'}
                    </p>
                    <p className='text-sm text-secondary-foreground font-body'>
                        While the exclusion is active, the platform will refuse new lottery
                        entries and surface a banner on every page. You can still claim any
                        escrowed winnings during this period.
                    </p>
                </VStack>

                {error && (
                    <p role='alert' className='text-xs text-destructive mb-3'>
                        {error}
                    </p>
                )}

                <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
                    <Button
                        variant='outline'
                        size='default'
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        CANCEL
                    </Button>
                    <Button
                        variant='destructive'
                        size='default'
                        onClick={onConfirm}
                        disabled={submitting}
                    >
                        {submitting
                            ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /><span>APPLYING…</span></>
                            : 'CONFIRM SELF-EXCLUSION'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
