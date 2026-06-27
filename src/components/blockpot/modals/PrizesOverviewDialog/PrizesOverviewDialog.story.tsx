import type { Meta, StoryObj } from '@storybook/react'
import { _PrizesOverviewDialog } from './PrizesOverviewDialog'
import { parseEther } from 'viem'

const meta: Meta<typeof _PrizesOverviewDialog> = {
    component: _PrizesOverviewDialog,
    parameters: {
        layout: 'centered',
    },
    argTypes: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {},
    render: () => {
        return <_PrizesOverviewDialog
            open={true}
            onClose={() => {}}
            pots={[parseEther('100'), parseEther('50'), parseEther('10'), parseEther('1'), parseEther('0.1')]}
            fiatConverter={(ethAmount: bigint) => {
                return {
                    value: ethAmount,
                    formattedValue: '$923.93'
                }
            }}
        />
    }
}