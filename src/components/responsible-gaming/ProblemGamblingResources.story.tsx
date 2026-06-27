import { Meta, StoryObj } from '@storybook/react'
import ProblemGamblingResources from './ProblemGamblingResources'

const meta: Meta<typeof ProblemGamblingResources> = {
    component: ProblemGamblingResources,
    decorators: [
        (Story) => (
            <div className='max-w-[600px] mx-auto p-4'>
                <Story />
            </div>
        ),
    ],
}
export default meta
type Story = StoryObj<typeof ProblemGamblingResources>

export const Default: Story = {}
