import NavigationItem from './NavigationItem'
import WalletButton from './WalletButton'
import HStack from '@/components/core/HStack/HStack'
import { Link, useLocation } from '@tanstack/react-router'
import { OperatorStatusIndicator } from '@/components/blockpot/common/OperatorStatusIndicator'

const NAVIGATION_ITEMS = [
    {
        label: 'Play',
        target: '/play',
        isSelected: true,
    },
    {
        label: 'Transparency',
        target: '/transparency',
    },
    {
        label: 'How to play',
        target: '/how-to-play',
    },
]

export default function Header() {
    const location = useLocation()
    const pathname = location.pathname

    return (
        <div className='@container w-full bg-[var(--color-header-surface)] border-b border-gray-700'>
            <div className='w-full @min-xs:max-w-[1348px] mx-auto h-20 flex items-center justify-between'>
                <div className='flex items-center gap-16'>
                    <Link to='/play'>
                        <img src='/assets/svgs/logo-with-text.svg' alt='Blockpot Logo' width={160} height={40} />
                    </Link>

                    <div className='flex items-center gap-10'>
                        {NAVIGATION_ITEMS.map((item) => (
                            <NavigationItem key={item.label} target={item.target} isSelected={pathname.includes(item.target)}>
                                {item.label}
                            </NavigationItem>
                        ))}
                    </div>
                </div>
                <HStack className='gap-4 items-center'>
                    <OperatorStatusIndicator />
                    <WalletButton />
                </HStack>
            </div>
        </div>
    )
}
