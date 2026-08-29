import { Meta, StoryObj } from '@storybook/react'
import Countdown, { CountdownProps } from './Countdown'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'

const Template = (props: CountdownProps) => <HStack>
    <VStack>
        <Countdown {...props} />
    </VStack>
</HStack>



const meta: Meta<typeof Countdown> = {
    component: Countdown,
    args: {
        timeBetweenRounds: 10000,
        nextDrawTime: 10000,
    },
    argTypes: {}
}

export default meta

type Story = StoryObj<typeof Countdown>
export const Basic: Story = {
    render: (props: CountdownProps) => <Template {...props} />,
}

/** Draw time has passed: the countdown fades out and the waiting copy pulses. */
export const WaitingForDraw: Story = {
    args: { nextDrawTime: Math.floor(Date.now() / 1000) - 10 },
    render: (props: CountdownProps) => <Template {...props} />,
}
