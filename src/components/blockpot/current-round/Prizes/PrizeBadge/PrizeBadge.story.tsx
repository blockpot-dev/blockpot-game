import type { Meta, StoryObj } from '@storybook/react'
import PrizeBadge, { PrizeBadgeProps } from './PrizeBadge'
import VStack from '@/components/core/VStack/VStack'

function Template(props: PrizeBadgeProps) {
    return <VStack>
        <PrizeBadge {...props} />
    </VStack>
}

const meta: Meta<typeof PrizeBadge> = {
    component: PrizeBadge
}

export default meta

type Story = StoryObj<typeof PrizeBadge>
export const Basic: Story = {
    args: {},
    render: (props: PrizeBadgeProps) => <Template {...props} />
}