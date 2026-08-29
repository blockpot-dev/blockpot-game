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
import { durationLabel, formatEndsAt } from './selfExclusionCopy'

export type SelfExclusionConfirmDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    duration: SelfExclusionDuration
    endsAt: string | null
    onConfirm: () => void
    submitting?: boolean
    error?: string
}

export default function SelfExclusionConfirmDialog({
    open,
    onOpenChange,
    duration,
    endsAt,
    onConfirm,
    submitting = false,
    error,
}: SelfExclusionConfirmDialogProps) {
    const isPermanent = duration === 'permanent'
    const label = isPermanent ? 'permanently' : `for ${durationLabel(duration)}`
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                data-slot='self-exclusion-confirm'
                className='sm:max-w-lg'
                showCloseButton={!submitting}
            >
                <DialogTopSection title={`Self-exclude ${label}?`} />
                <VStack className='gap-3 mb-4'>
                    <p className='text-sm text-foreground'>
                        {isPermanent
                            ? 'You won\'t be able to enter draws again.'
                            : <>You won&apos;t be able to enter draws until <strong>{formatEndsAt(endsAt)}</strong>.</>}
                        {' '}You can still claim prizes.
                    </p>
                    <p className='text-sm text-secondary-foreground font-body'>
                        {isPermanent
                            ? 'This can\'t be cancelled or shortened once set. It can only be lifted after a review by the Blockpot team.'
                            : 'This can\'t be cancelled or shortened once set.'}
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
                        GO BACK
                    </Button>
                    <Button
                        variant='destructive'
                        size='default'
                        onClick={onConfirm}
                        disabled={submitting}
                    >
                        {submitting
                            ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /><span>SETTING UP…</span></>
                            : `SELF-EXCLUDE ${label.toUpperCase()}`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
