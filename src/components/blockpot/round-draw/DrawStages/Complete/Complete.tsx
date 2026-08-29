import { Button } from '@/components/ui/button'
import { TERM } from '@/constants/copy'

export type CompleteProps = {
    onSeeResults: () => void
}

export default function Complete(props: CompleteProps) {
    return <div className='flex flex-col gap-4 items-center text-center animate-grow-in'>
        <span className='text-foreground heading-5xl uppercase'>{TERM.draw} complete</span>
        <span className='text-secondary-foreground text-sm'>Check your entries on the right.</span>
        <Button onClick={props.onSeeResults}>
            See results
        </Button>
    </div>
}
