import { Meta, StoryObj } from '@storybook/react'
import HStack, { HStackProps } from './HStack'
import VStack from '../VStack/VStack'

const Template = (props: HStackProps) => <HStack>
    <VStack>
        <HStack {...props}>
            <p>Item 1</p>
            <p>Item 2</p>
            <p>Item 3</p>
        </HStack>
        <HStack {...props}>
            <p>Item 1</p>
            <p>Item 2</p>
            <p>Item 3</p>
        </HStack>
    </VStack>
</HStack>



const meta: Meta<typeof HStack> = {
    component: HStack,
    args: {},
    argTypes: {}
}

export default meta

type Story = StoryObj<typeof HStack>
export const Basic: Story = {
    render: (props: HStackProps) => <Template {...props} />,
    
}
