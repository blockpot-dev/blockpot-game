import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { Meta, StoryObj } from '@storybook/react'
import DrawnNumbersPanel, { DrawnNumbersPanelProps } from '.'
import { parseEther } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'

const Template = (props: DrawnNumbersPanelProps) => {
    return (
        <HStack>
            <VStack className='w-[256px]'>
                <DrawnNumbersPanel {...props} />
            </VStack>
        </HStack>
    )
}



const meta: Meta<typeof DrawnNumbersPanel> = {
    component: DrawnNumbersPanel,
    args: {},
    argTypes: {}
}

export default meta

type Story = StoryObj<typeof DrawnNumbersPanel>
export const Basic: Story = {
    render: (props: DrawnNumbersPanelProps) => <Template
        stagedDraw={{
            drawnNumbers: [
                { ordinal: 1, isPlayerWinner: false, number: 1_164_026, winner: ZERO_ADDRESS, prize: { amount: parseEther('100'), fiat: parseEther('100'), amountFormatted: '100', fiatFormatted: '$100', nativeToken: 'eth' } },
                { ordinal: 2, isPlayerWinner: true, number: 457, winner: '0x123', prize: { amount: parseEther('50'), fiat: parseEther('50'), amountFormatted: '50', fiatFormatted: '$50', nativeToken: 'eth' } },
                { ordinal: 3, isPlayerWinner: true, number: 890, winner: '0x123', prize: { amount: parseEther('25'), fiat: parseEther('25'), amountFormatted: '25', fiatFormatted: '$25', nativeToken: 'eth' } },
                { ordinal: 4, isPlayerWinner: true, number: 234, winner: '0x123', prize: { amount: parseEther('1'), fiat: parseEther('1'), amountFormatted: '1', fiatFormatted: '$1', nativeToken: 'eth' } },
                { ordinal: 5, isPlayerWinner: false, number: 521483, winner: ZERO_ADDRESS, prize: { amount: parseEther('100'), fiat: parseEther('100'), amountFormatted: '100', fiatFormatted: '$100', nativeToken: 'eth' } }
            ]
        }}
        totalDrawnNumbers={100}
        advanceDraw={() => {}}
    />,

}

/** Draw just started: counter reads "0 of 5 drawn" and every slot carries waiting copy. */
export const WaitingForFirstNumber: Story = {
    render: () => <Template
        stagedDraw={{ drawnNumbers: [] }}
        totalDrawnNumbers={5}
        advanceDraw={() => {}}
    />,
}
