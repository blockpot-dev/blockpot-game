import { Link } from '@tanstack/react-router'

export type NavigationItemProps = {
    children: React.ReactNode;
    isSelected?: boolean;
    target: string;
}

export default function NavigationItem({ children, isSelected = false, target }: NavigationItemProps) {
    return (
        <Link to={target} className='group/nav-item rounded-md focus-visible:outline-none'>
            <div className='relative flex h-full items-center justify-center cursor-pointer px-3 py-1.5 rounded-md transition-shadow group-focus-visible/nav-item:ring-2 group-focus-visible/nav-item:ring-[var(--color-warm-500)]/50'>
                <span
                    data-selected={isSelected}
                    className='text-base font-medium tracking-tight font-[var(--font-body)] text-foreground/80 transition-colors duration-200 group-hover/nav-item:text-foreground data-[selected=true]:text-[var(--color-warm-500)] data-[selected=true]:font-semibold'
                >
                    {children}
                </span>
                <span
                    aria-hidden='true'
                    data-selected={isSelected}
                    className='absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-warm-500)] origin-center scale-x-0 transition-transform duration-200 ease-out group-hover/nav-item:scale-x-100 data-[selected=true]:scale-x-100'
                />
            </div>
        </Link>
    )
}
