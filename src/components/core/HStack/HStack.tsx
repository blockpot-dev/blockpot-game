import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export type HStackProps = {
    className?: string
    children: ReactNode
};

export default function HStack(props: HStackProps) {
    return (
        <div className={cn('flex flex-row gap-2', props.className)}>
            {props.children}
        </div>
    )
}