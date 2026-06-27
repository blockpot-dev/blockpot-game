import type { Meta, StoryObj } from '@storybook/react'
import CompactCountValue, { CompactCountValueProps } from './CompactCountValue'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'

const VALUES = [42, 1234, 23456, 1_500_000]

function Grid(props: { variant: CompactCountValueProps['variant'], description: string }) {
    return (
        <VStack className='gap-6'>
            {VALUES.map((value) => (
                <HStack key={value} className='items-center gap-4'>
                    <span className='text-secondary-foreground text-sm w-24'>value={value}</span>
                    <span className='heading-3xl text-foreground leading-[0.8] inline-block min-w-24 text-center'>
                        <CompactCountValue
                            value={value}
                            variant={props.variant}
                            unit='tickets'
                            description={props.description}
                        />
                    </span>
                </HStack>
            ))}
        </VStack>
    )
}

const meta: Meta<typeof CompactCountValue> = {
    component: CompactCountValue
}

export default meta

type Story = StoryObj<typeof CompactCountValue>

export const Animated: Story = {
    render: () => <Grid variant='animated' description='Total tickets purchased for the current round.' />
}

export const Static: Story = {
    render: () => <Grid variant='static' description='Your tickets purchased for the current round.' />
}
