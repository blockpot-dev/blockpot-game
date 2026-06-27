import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'

const highlightDividerVariants = cva('opacity-75 from-transparent via-white to-transparent', {
    variants: {
        direction: {
            horizontal: 'h-[1px] bg-gradient-to-l',
            vertical: 'w-[1px] bg-gradient-to-b'
        }
    }
})

export type HighlightDividerProps = VariantProps<typeof highlightDividerVariants> & {
    className?: string
}

export default function HighlightDivider(props: HighlightDividerProps) {
    const { direction, className } = props
    return (
        <div
            className={cn(highlightDividerVariants({ direction }), className)}
        />
    )
}