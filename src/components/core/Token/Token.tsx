import { cn } from '@/lib/utils'

export type TokenLabelProps = {
    className?: string
    size?: TokenSize
    token?: 'eth'
}

type TokenSize = 'xs' | 'sm' | 'md' | 'lg' | '1.5rem' | '2rem'

export default function Token(props: TokenLabelProps) {
    const { size = 'md', token, className } = props

    return (
        <img
            className={
                cn(className, {
                    'w-3 h-3': size === 'xs',
                    'w-4 h-4': size === 'sm',
                    'w-5 h-5': size === 'md',
                    'w-6 h-6': size === 'lg',
                    'w-[2.8rem] h-[2.8rem]': size === '1.5rem',
                    'w-16 h-16': size === '2rem',
                })
            }
            alt='ethereum'
            src={`/icons/${token}.svg`}
        />
    )
}