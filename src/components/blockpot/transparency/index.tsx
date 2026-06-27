import VStack from '@/components/core/VStack/VStack'
import BlockpotBalances from './BlockpotBalances'
import TierThresholds from './TierThresholds'

export default function Transparency() {
    return (
        <div className='@container w-full h-full'>
            <div className='@min-xs:max-w-[1348px] mx-auto mt-8 mb-auto'>
                <VStack className='gap-8 p-6'>
                    <h1 className='heading-4xl text-foreground'>Transparency</h1>

                    <p className='text-sm text-secondary-foreground max-w-2xl'>
                        Every draw, every payout, every pot allocation happens on-chain and is
                        independently verifiable. This page surfaces the live contract state so
                        you can check it for yourself.
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <BlockpotBalances />
                        <TierThresholds />
                    </div>
                </VStack>
            </div>
        </div>
    )
}
