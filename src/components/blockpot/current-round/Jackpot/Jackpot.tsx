import AnimatingNumber from '@/components/core/display/AnimatingNumber/AnimatingNumber'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { formatEtherMaxDecimalsGreedy } from '@/utilities/formatters'
import { Container, Vortex } from '@blockpot-dev/blockpot-design-system'

export type JackpotProps = {
    nativeAmount: bigint
    fiatAmountFormatted: string
}

export default function Jackpot(props: JackpotProps) {
    const { nativeAmount, fiatAmountFormatted } = props

    return (
        <Container className='relative h-full' containerClassName='flex-1 min-h-[252px]'>
            <div className='absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,_#B9D98D_15.63%,_#EB6E24_63.85%,_#F16522_89.13%,_#EC4029_100%)] opacity-50 blur-xl' />
            <div className='absolute top-0 left-0 w-full h-full bg-gray-950 rounded-sm overflow-hidden'>
                <Vortex className='absolute top-[50%] left-[50%] w-[460px] h-[460px] -translate-x-1/2 -translate-y-1/2' />
            </div>
            <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[radial-gradient(50%_50%_at_50%_50%,_#0E112888_28%,_rgba(14,17,40,0)_100%)]'>
                <VStack className='gap-2 items-center'>
                    <span className='heading-xl leading-[0.8] uppercase'>Jackpot</span>
                    <HStack className='gap-2 items-center'>
                        <img src='/assets/svgs/tokens/eth.svg' alt='ETH' className="w-12 h-12" />
                        <AnimatingNumber value={formatEtherMaxDecimalsGreedy(nativeAmount, 2)} />
                    </HStack>
                    <span className='text-base text-secondary-foreground'>{fiatAmountFormatted}</span>
                </VStack>
            </div>
        </Container>
    )
}