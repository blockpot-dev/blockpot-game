import { Meta, StoryObj } from '@storybook/react'
import VStack, { VStackProps } from './VStack'
import HStack from '../HStack/HStack'

const Template = (props: VStackProps) => <HStack>
    <VStack>
        <VStack {...props}>
            <p>Item 1</p>
            <p>Item 2</p>
            <p>Item 3</p>
        </VStack>
        <VStack {...props}>
            <p>Item 1</p>
            <p>Item 2</p>
            <p>Item 3</p>
        </VStack>
    </VStack>
</HStack>



const meta: Meta<typeof VStack> = {
    component: VStack,
    args: {},
    argTypes: {}
}

export default meta

type Story = StoryObj<typeof VStack>
export const Basic: Story = {
    render: (props: VStackProps) => <Template {...props} />,
    
}
