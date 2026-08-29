import VStack from '@/components/core/VStack/VStack'
import BlockpotBalances from './BlockpotBalances'
import TierThresholdsGate from './TierThresholdsGate'
import DrawFairnessSection from './DrawFairnessSection/DrawFairnessSection'

export default function Transparency() {
    return (
        <div className='@container w-full flex-1 pb-8'>
            <div className='@min-xs:max-w-[1348px] mx-auto mt-8'>
                <VStack className='gap-8 p-6'>
                    <h1 className='heading-4xl text-foreground'>Transparency</h1>

                    <p className='text-sm text-secondary-foreground max-w-2xl'>
                        <span className='font-medium text-foreground'>Don&apos;t trust it. Check it.</span>{' '}
                        Every draw, payout and prize-pool allocation is on-chain. This page shows the
                        live contract state so you can verify it yourself.
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 [&>*:only-child]:md:col-span-2'>
                        <BlockpotBalances />
                        <TierThresholdsGate />
                    </div>

                    <DrawFairnessSection />
                </VStack>
            </div>
        </div>
    )
}
