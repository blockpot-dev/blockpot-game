import { LotteryDrawContext } from '@/providers/BlockpotDrawProvider'
import DrawRoundInfo, { DrawRoundInfoProps } from './DrawRoundInfo/DrawRoundInfo'
import Waiting from './DrawStages/Waiting/Waiting'
import Drawing from './DrawStages/Drawing/Drawing'
import { Address } from 'viem'
import { memo } from 'react'
import { Container, Vortex } from '@blockpot-dev/block-pot-design-system'

function RenderDrawStage(props: { draw: LotteryDrawContext, accountAddress: Address }) {
    const { draw, accountAddress } = props
    switch (draw.drawStage.type) {
    case 'waiting':
        return <Waiting />
    case 'drawing':
        return <Drawing
            stagedDraw={draw.drawStage.stagedDraw}
            accountAddress={accountAddress}
        />
    case 'complete':
        return <></>
    }
}

export type RoundDrawProps = {
    accountAddress: Address
    draw: LotteryDrawContext
    roundInfo: DrawRoundInfoProps
}

function RoundDraw(props: RoundDrawProps) {
    const { accountAddress, draw } = props

    return <div className='flex flex-col flex-1 gap-6 p-6 min-h-[720px]'>
        <DrawRoundInfo {...props.roundInfo} />
        <Container className='relative flex-1 bg-[#0E1128]' containerClassName='flex-1 flex flex-col min-h-[534px] overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-full bg-gray-950 overflow-hidden'>
                <Vortex className='absolute w-[900px] h-[900px] top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2' />
            </div>
            <div className='z-1 absolute top-[50%] left-[50%] w-[534px] h-[534px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-radial-[50%_50%_at_50%_50%] from-[#0E1128] from-44% to-transparent to-[89.5%]'/>
            <div className='z-2 absolute top-[50%] left-[50%] w-[534px] h-[534px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center mix-blend-color-dodge animate-pulse'>
                <svg xmlns="http://www.w3.org/2000/svg" width="370" height="370" viewBox="0 0 370 370" fill="none" className='z-2'>
                    <g opacity="0.7" filter="url(#filter0_f_2970_15383)">
                        <circle cx="185" cy="185" r="85" fill="#93949E" />
                    </g>
                    <defs>
                        <filter id="filter0_f_2970_15383" x="0" y="0" width="370" height="370" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur_2970_15383" />
                        </filter>
                    </defs>
                </svg>
            </div>
            <div className='z-3 absolute top-0 left-0 w-full h-full flex items-center justify-center '>
                <RenderDrawStage draw={draw} accountAddress={accountAddress} />
            </div>
        </Container>
    </div>
}

export default memo(RoundDraw)