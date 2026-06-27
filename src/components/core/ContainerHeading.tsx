import { ReactNode } from 'react'
import HStack from './HStack/HStack'

export type ContainerHeadingProps = {
    children: string | ReactNode
    trailing?: ReactNode
}

export function ContainerHeading(props: ContainerHeadingProps) {
    const { children, trailing } = props
    return (
        <HStack className='justify-between items-center'>
            {
                typeof children === 'string' ?
                    <span className='heading-xl uppercase leading-none text-foreground'>{children}</span>
                    : children
            }
            <HStack className='gap-1.5 items-center'>
                {trailing}
            </HStack>
        </HStack>
    )
}
