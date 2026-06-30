import { Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import useBalanceAllocations from '@/hooks/contracts/transparency/useBalanceAllocations'
import useNativeCurrency from '@/hooks/web3/useNativeCurrency'
import { formatEtherMaxDecimalsGreedy } from '@/utilities/formatters'

export function _BlockpotBalances() {
    const { pot, nextPot, parentGame, contractBalance, fundsManagerAddress } = useBalanceAllocations()
    const total = pot + nextPot + parentGame
    const nativeCurrency = useNativeCurrency()

    const balances = [
        { label: 'Current pot', amount: pot },
        { label: 'Next pot', amount: nextPot },
        { label: 'Parent game allocation', amount: parentGame },
    ]

    return (
        <Container className='p-6' containerClassName='h-full'>
            <VStack className='gap-4'>
                <h2 className='text-xl font-semibold'>Balance allocations</h2>

                <div className='border-t border-border' />

                <VStack className='gap-1'>
                    <span className='text-sm font-medium text-foreground'>Contract: BlockpotFundsManager</span>
                    <span className='font-mono text-xs text-muted-foreground break-all'>
                        {fundsManagerAddress.toUpperCase().replace('0X', '0x')}
                    </span>
                </VStack>

                <div className='border-t border-border' />

                <VStack className='gap-2'>
                    {balances.map((balance) => (
                        <HStack key={balance.label} className='justify-between'>
                            <span className='text-sm text-secondary-foreground'>{balance.label}</span>
                            <span className='text-sm font-mono'>
                                {formatEtherMaxDecimalsGreedy(balance.amount, 4)} {nativeCurrency}
                            </span>
                        </HStack>
                    ))}
                </VStack>

                <div className='border-t border-border' />

                <VStack className='gap-2'>
                    <HStack className='justify-between'>
                        <span className='text-sm font-medium text-foreground'>Total allocations</span>
                        <span className='text-sm font-mono font-medium'>
                            {formatEtherMaxDecimalsGreedy(total, 4)} {nativeCurrency}
                        </span>
                    </HStack>
                    <HStack className='justify-between'>
                        <span className='text-sm font-medium text-foreground'>Contract balance</span>
                        <span className='text-sm font-mono font-medium'>
                            {formatEtherMaxDecimalsGreedy(contractBalance, 4)} {nativeCurrency}
                        </span>
                    </HStack>
                </VStack>

                <div className='border-t border-border' />

                <p className='text-xs text-muted-foreground'>
                    The contract balance should always be greater than or equal to the total allocations
                    (the sum of the individual allocations). The funds manager is responsible for holding
                    managing the allocations and disbursing funds when necessary.
                </p>
            </VStack>
        </Container>
    )
}

export default function BlockpotBalances() {
    return <_BlockpotBalances />
}
