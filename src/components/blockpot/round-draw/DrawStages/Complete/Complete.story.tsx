import type { Meta, StoryObj } from '@storybook/react'
import Complete, { CompleteProps } from './Complete'
import VStack from '@/components/core/VStack/VStack'

function Template(props: CompleteProps) {
    return <VStack>
        <Complete {...props} />
    </VStack>
}

const meta: Meta<typeof Complete> = {
    component: Complete
}

export default meta

type Story = StoryObj<typeof Complete>
export const Basic: Story = {
    args: { onSeeResults: () => {} },
    render: (props: CompleteProps) => <Template {...props} />
}
