import { Button } from '@/components/ui/button'

export type CompleteProps = {
    advanceDrawStage: () => void
}

export default function Complete(props: CompleteProps) {
    return <div className='flex flex-col gap-2'>
        <span>Complete</span>
        <Button onClick={props.advanceDrawStage}>
            Continue
        </Button>
    </div>
}