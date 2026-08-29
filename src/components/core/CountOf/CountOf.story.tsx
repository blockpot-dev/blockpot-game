import { Meta, StoryObj } from '@storybook/react'
import CountOf from './CountOf'

const meta: Meta<typeof CountOf> = { component: CountOf }
export default meta
type Story = StoryObj<typeof CountOf>

export const Heading: Story = {
    render: () => <span className='heading-3xl text-foreground'><CountOf value='3' total='10' /></span>,
}
export const WithSuffix: Story = {
    render: () => <span className='body-lg font-bold'><CountOf value='2' total='5' suffix='drawn' /></span>,
}
