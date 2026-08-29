import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type CountOfProps = {
    value: ReactNode
    total: ReactNode
    /** Optional trailing word, e.g. "drawn". Rendered like the connector. */
    suffix?: ReactNode
    /** Classes for the de-emphasised connector ("of") and suffix. */
    connectorClassName?: string
}

/**
 * "3 of 10" with the numbers in the surrounding (display) font and the connector in the body
 * font, smaller and muted, so the figures carry the emphasis.
 */
export default function CountOf(props: CountOfProps) {
    const { value, total, suffix, connectorClassName } = props
    const connector = cn('font-body font-normal text-secondary-foreground text-[0.5em] align-middle mx-[0.35em]', connectorClassName)
    return (
        <span data-testid='count-of'>
            {value}
            <span className={connector}>{' of '}</span>
            {total}
            {suffix !== undefined && <span className={connector}>{' '}{suffix}</span>}
        </span>
    )
}
