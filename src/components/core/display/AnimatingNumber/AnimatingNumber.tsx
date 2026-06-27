import { Fragment, Key, useEffect, useState } from 'react'
import { useTimeout } from '@/hooks/utilities/useTimeout'
import { DECIMAL_SEPARATOR, GROUP_SEPARATOR } from '@/utilities/decimals'
import { getClientLocale } from '@/utilities/locale'
import { cn } from '@/lib/utils'
import { VariantProps, cva } from 'class-variance-authority'

const MEDIUM_WIDTH_LOOKUP: Record<number, string> = {
    0: '30.27px',
    1: '22.22px',
    2: '28.11px',
    3: '29.38px',
    4: '30.05px',
    5: '29.06px',
    6: '30.55px',
    7: '27px',
    8: '29.94px',
    9: '30.55px'
}

const BOLD_WIDTH_LOOKUP: Record<number, string> = {
    0: '28.84px',
    1: '14.69px',
    2: '28.84px',
    3: '28.84px',
    4: '28.84px',
    5: '28.84px',
    6: '28.84px',
    7: '28.84px',
    8: '28.84px',
    9: '28.84px',
}

const WIDTH_LOOKUP = {
    medium: MEDIUM_WIDTH_LOOKUP,
    bold: BOLD_WIDTH_LOOKUP
}

// Size-based scaling factors (relative to md which is 3.5rem)
const SIZE_SCALE_FACTORS: Record<string, number> = {
    xs: 0.429, // 1.5rem / 3.5rem
    sm: 0.5285, // 1.85rem / 3.5rem
    md: 1.0, // 3.5rem / 3.5rem (baseline)
    lg: 1.286, // 4.5rem / 3.5rem
    xl: 1.714 // 6rem / 3.5rem
}

// Height calculations based on size (md uses 48px, scaled proportionally)
const SIZE_HEIGHTS: Record<string, string> = {
    xs: '21px',
    sm: '24px',
    md: '48px',
    lg: '62px',
    xl: '82px'
}

// Separator widths based on size (md uses 12px, scaled proportionally)
const SIZE_SEPARATOR_WIDTHS: Record<string, string> = {
    xs: '5px',
    sm: '8px',
    md: '12px',
    lg: '15px',
    xl: '21px'
}

const DIGITS = Array.from({ length: 10 })
    .map((_, index) => new String(index))
    .reverse()


const digitColumnVariants = cva(
    'absolute w-full h-[1000%] bottom-0 transform transition-transform duration-500 ease-pulse',
    {
        variants: {
            digit: {
                1: 'translate-y-[10%]',
                2: 'translate-y-[20%]',
                3: 'translate-y-[30%]',
                4: 'translate-y-[40%]',
                5: 'translate-y-[50%]',
                6: 'translate-y-[60%]',
                7: 'translate-y-[70%]',
                8: 'translate-y-[80%]',
                9: 'translate-y-[90%]',
                0: 'translate-y-0'
            },
        },
        defaultVariants: {
            digit: 0
        }
    }
)

type DigitColumnProps = VariantProps<typeof digitColumnVariants>

function DigitColumn(props: { value: number }) {
    return <div className={cn(digitColumnVariants({ digit: props.value as DigitColumnProps['digit'] }))}>
        {
            DIGITS.map((d) => (
                <div key={d as Key} className={'text-center h-[10%]'}>
                    <span className='inline-block h-[100%]'>{d}</span>
                </div>
            ))
        }
    </div>
}

function Digits(props: { value: number, weight: 'medium' | 'bold', size: string }) {
    const [appeared, setAppeared] = useState(false)
    useEffect(() => {
        setAppeared(true)
    }, [])
    
    const scaleFactor = SIZE_SCALE_FACTORS[props.size] ?? 1.0
    const baseWidthStr = WIDTH_LOOKUP[props.weight][props.value] ?? '1em'
    // Extract numeric value from strings like '30.27px' or '1em'
    const baseWidth = parseFloat(baseWidthStr.replace(/[^\d.]/g, '')) || 1
    const scaledWidth = baseWidth * scaleFactor
    const height = SIZE_HEIGHTS[props.size] ?? '48px'
    
    return <div className={'relative animation-fade-in'} style={{ 
        height,
        width: appeared ? `${scaledWidth}px` : '0px', 
        transition: 'width 0.5s ease-in-out' 
    }}>
        <DigitColumn value={props.value} />
        <div className={'invisible'} style={{ height }}>0</div>
    </div>
}

function formatForDisplay(value: string) {
    const components = value.split(DECIMAL_SEPARATOR)
    const whole = components[0]
    const fractional = components.length > 1 ? components[1] : ''
    const formatter = Intl.NumberFormat(getClientLocale() ?? 'en')
    return {
        whole: formatter.format(Number(whole)).split(',').map((v) => v.split('').reverse()).reverse(),
        fractional: fractional.split('').reverse()
    }
}

const animatingNumberVariants = cva(
    'text-[1.5rem] text-foreground leading-none m-auto flex flex-row-reverse overflow-hidden relative',
    {
        variants: {
            size: {
                xs: 'text-[1.5rem]',
                sm: 'font-display text-[1.85rem] leading-[0.8] translate-y-[-2px]',
                md: 'font-display text-[3.5rem] leading-[0.8]',
                lg: 'text-[4.5rem]',
                xl: 'text-[6rem]',
            },
            weight: {
                medium: 'font-medium',
                bold: ''
            },
            pulse: {
                true: 'animate-pulse-green'
            }
        },
        defaultVariants: {
            size: 'md',
            weight: 'bold',
            pulse: false
        }
    }
)

export type AnimatingNumberProps = {
    value: string
} & VariantProps<typeof animatingNumberVariants>

export default function AnimatingNumber(props: AnimatingNumberProps) {
    const { size, value, weight } = props
    const [currentValue, setCurrentValue] = useState('')
    const [pulse, setPulse] = useState(false)

    const { start } = useTimeout(() => {
        setPulse(false)
    }, 500)

    
    useEffect(() => {
        if (value != currentValue) {
            setPulse(true)
            setCurrentValue(value)
            start()
        }
    }, [value, currentValue, start])
    
    const { whole, fractional } = formatForDisplay(currentValue)
    const sizeKey = size ?? 'md'
    const height = SIZE_HEIGHTS[sizeKey] ?? '48px'
    const separatorWidth = SIZE_SEPARATOR_WIDTHS[sizeKey] ?? '12px'
    
    return <div className={animatingNumberVariants({ size, pulse, weight })}>
        {
            fractional.length > 0
                ? <>
                    {
                        fractional.map((d, i) => (
                            <Digits key={`${i}`} value={parseInt(d)} weight={weight ?? 'bold'} size={sizeKey} />
                        ))
                    }
                    <span style={{ width: separatorWidth, height }}>{DECIMAL_SEPARATOR}</span>
                </>
                : null
        }
        {
            whole.map((w, i) => (
                <Fragment key={i}>
                    {
                        w.map((d, i) => (
                            <Digits key={`${i}`} value={parseInt(d)} weight={weight ?? 'bold'} size={sizeKey} />
                        ))
                    }
                    {
                        i < whole.length - 1
                            ? <span style={{ width: separatorWidth, height }}>{GROUP_SEPARATOR}</span>
                            : null
                    }
                </Fragment>
            ))
        }
    </div>
}