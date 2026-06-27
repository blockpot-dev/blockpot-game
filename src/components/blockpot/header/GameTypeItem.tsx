interface GameTypeItemProps {
    children: React.ReactNode;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function GameTypeItem({ children, isSelected = false, onClick }: GameTypeItemProps) {
    function Content() {
        if (isSelected) {
            return (
                <>
                    <span className='text-sm font-bold text-foreground z-1'>
                        {children}
                    </span>
                    <div className='absolute bottom-[-32px] left-0 w-[calc(100%+32px)] mx-[-16px] h-[48px] text-[var(--color-warm-500)]/25 blur-sm'>
                        <svg width='100%' height='32px' viewBox='0 0 128 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <ellipse cx='64' cy='16' rx='56' ry='16' fill='currentColor'/>
                        </svg>
                    </div>
                    <div className='absolute bottom-0 left-0 w-[calc(100%+32px)] mx-[-16px] h-[1px] bg-gradient-to-r from-[var(--color-warm-500)]/0 via-[var(--color-warm-500)] to-[var(--color-warm-500)]/0'/>
                </>
            )
        } else {
            return (
                <span className='text-sm text-gray-400'>
                    {children}
                </span>
            )
        }
    }

    return (
        <div className='relative h-full flex items-center justify-center cursor-pointer overflow-y-clip' onClick={onClick}>
            <Content />
        </div>
    )
} 