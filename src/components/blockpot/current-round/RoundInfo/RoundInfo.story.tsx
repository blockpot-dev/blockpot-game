import type { Meta, StoryObj } from '@storybook/react'
import RoundInfo, { RoundInfoProps } from './RoundInfo'
import { SelectedGameProvider } from '@/providers/SelectedGameProvider'

function Template(props: RoundInfoProps) {
    return (
        <SelectedGameProvider>
            <div className='w-[800px]'>
                <RoundInfo {...props} />
            </div>
        </SelectedGameProvider>
    )
}

const meta: Meta<typeof RoundInfo> = {
    component: RoundInfo
}

export default meta

type Story = StoryObj<typeof RoundInfo>

export const Basic: Story = {
    args: {
        potIndex: 5,
        currentRound: 3,
        maximumRounds: 10,
        winnerChance: 3200,
        totalTickets: 12,
        yourTickets: 3
    },
    render: (props: RoundInfoProps) => <Template {...props} />
}

export const HighVolume: Story = {
    args: {
        potIndex: 5,
        currentRound: 3,
        maximumRounds: 10,
        winnerChance: 3200,
        totalTickets: 23456,
        yourTickets: 1234
    },
    render: (props: RoundInfoProps) => <Template {...props} />
}
