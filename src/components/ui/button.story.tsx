import { Meta, StoryObj } from '@storybook/react'
import { Button, ButtonProps } from './button'

const Template = (props: ButtonProps) => <div className='flex'>
    <div className='flex flex-col gap-2'>
        <Button>Create Account</Button>
        <Button variant='accent'>Enter</Button>
        <Button variant='secondary'>Label</Button>
    </div>
</div>



const meta: Meta<typeof Button> = {
    component: Button,
    args: {},
    argTypes: {}
}

export default meta

type Story = StoryObj<typeof Button>
export const Basic: Story = {
    render: (props: ButtonProps) => <Template {...props} />,
}
