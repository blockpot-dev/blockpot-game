import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export type VStackProps = {
    children: ReactNode
    className?: string
    ref?: (node: HTMLDivElement | null) => void
};

export default function VStack(props: VStackProps) {
    return (
        <div className={cn('flex flex-col gap-2', props.className)} ref={props.ref}>
            {props.children}
        </div>
    )
}