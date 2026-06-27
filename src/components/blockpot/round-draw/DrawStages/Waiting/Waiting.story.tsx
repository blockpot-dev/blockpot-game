import type { Meta, StoryObj } from '@storybook/react'
import Waiting from './Waiting'
import VStack from '@/components/core/VStack/VStack'

function Template() {
    return <VStack>
        <Waiting />
    </VStack>
}

const meta: Meta<typeof Waiting> = {
    component: Waiting
}

export default meta

type Story = StoryObj<typeof Waiting>
export const Basic: Story = {
    args: {},
    render: () => <Template />
}