import { Meta, StoryObj } from '@storybook/react'
import CountdownTime, { CountdownTimeProps } from './CountdownTime'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'

const Template = (props: CountdownTimeProps) => <HStack>
    <VStack>
        <CountdownTime timeRemaining={500} />
    </VStack>
</HStack>



const meta: Meta<typeof CountdownTime> = {
    component: CountdownTime,
    args: {},
    argTypes: {}
}

export default meta

type Story = StoryObj<typeof CountdownTime>
export const Basic: Story = {
    render: (props: CountdownTimeProps) => <Template {...props} />,
    
}
