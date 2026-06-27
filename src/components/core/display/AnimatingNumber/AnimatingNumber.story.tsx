import type { Meta, StoryObj } from '@storybook/react'

import { useEffect, useState } from 'react'
import AnimatingNumber, { AnimatingNumberProps } from './AnimatingNumber'
import VStack from '../../VStack/VStack'
import { useInterval } from '@/hooks/utilities/useInterval'

function Template(props: AnimatingNumberProps) {
    const [value, setValue] = useState(props.value)
    const interval = useInterval(() => {
        setValue((v) => (Number(v) + Math.floor((Math.random() * 123))).toFixed(4))
    }, 2500)

    useEffect(() => {
        interval.start()
        return interval.stop
    }, [interval])

    useEffect(() => {
        for (let i = 0; i < 10; i++) {
            const width = (document.getElementById(`number-${i}`)?.getBoundingClientRect().width ?? 0)
            console.log(`${i}: ${width.toFixed(2)}px`)
        }
    }, [])
    return <VStack>
        <AnimatingNumber {...props} size='md' value={value} />
        <div className={'text-[3rem] font-bold'}>
            <span id='number-0'>0</span><br/>
            <span id='number-1'>1</span><br/>
            <span id='number-2'>2</span><br/>
            <span id='number-3'>3</span><br/>
            <span id='number-4'>4</span><br/>
            <span id='number-5'>5</span><br/>
            <span id='number-6'>6</span><br/>
            <span id='number-7'>7</span><br/>
            <span id='number-8'>8</span><br/>
            <span id='number-9'>9</span><br/>
        </div>
    </VStack>
}

const meta: Meta<typeof AnimatingNumber> = {
    component: AnimatingNumber
}

export default meta

type Story = StoryObj<typeof AnimatingNumber>
export const Basic: Story = {
    args: {
        value: '123',
        size: 'md'
    },
    render: (props: AnimatingNumberProps) => <Template {...props} />
}