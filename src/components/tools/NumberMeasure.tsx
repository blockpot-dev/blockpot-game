import { useEffect, useRef } from 'react'

export default function NumberMeasure() {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return
        const spans = ref.current.querySelectorAll('span')
        const widths: Record<string, number> = {}
        spans.forEach((span: HTMLSpanElement) => {
            widths[span.id] = span.getBoundingClientRect().width
        })
        console.log(widths)
    }, [])

    return (
        <div ref={ref} className='text-5xl font-bold'>
            <span id='0'>0</span>
            <span id='1'>1</span>
            <span id='2'>2</span>
            <span id='3'>3</span>
            <span id='4'>4</span>
            <span id='5'>5</span>
            <span id='6'>6</span>
            <span id='7'>7</span>
            <span id='8'>8</span>
            <span id='9'>9</span>
        </div>
    )
}