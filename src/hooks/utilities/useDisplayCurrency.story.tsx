import { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import useDisplayCurrency, {
    DISPLAY_CURRENCY_STORAGE_KEY,
    type DisplayCurrency,
} from './useDisplayCurrency'

function HookDemo() {
    const { currency, cycle, setCurrency } = useDisplayCurrency()
    const [eurAvailable, setEurAvailable] = useState(true)
    const [storedKey, setStoredKey] = useState<string | null>(null)

    useEffect(() => {
        try {
            setStoredKey(window.localStorage.getItem(DISPLAY_CURRENCY_STORAGE_KEY))
        } catch {
            setStoredKey(null)
        }
    }, [currency])

    const available: DisplayCurrency[] = eurAvailable ? ['ETH', 'USD', 'EUR'] : ['ETH', 'USD']

    return (
        <VStack className='gap-4 p-6 bg-background text-foreground min-w-[420px]'>
            <span className='text-xs uppercase tracking-wide text-secondary-foreground'>
                useDisplayCurrency demo
            </span>

            <HStack className='items-center gap-3'>
                <span className='text-sm text-secondary-foreground'>Current:</span>
                <span className='text-sm text-foreground font-bold font-mono'>{currency}</span>
            </HStack>

            <HStack className='items-center gap-3'>
                <span className='text-sm text-secondary-foreground'>localStorage[{DISPLAY_CURRENCY_STORAGE_KEY}]:</span>
                <span className='text-sm text-foreground font-mono'>{storedKey ?? '(unset)'}</span>
            </HStack>

            <HStack className='items-center gap-3'>
                <label className='text-sm text-secondary-foreground flex items-center gap-2'>
                    <input
                        type='checkbox'
                        checked={eurAvailable}
                        onChange={(e) => setEurAvailable(e.target.checked)}
                    />
                    EUR available on this chain
                </label>
            </HStack>

            <HStack className='gap-2 flex-wrap'>
                <button
                    type='button'
                    onClick={() => cycle(available)}
                    className='px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80'
                >
                    Cycle ({available.join(' → ')})
                </button>
                <button
                    type='button'
                    onClick={() => setCurrency('ETH')}
                    className='px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80'
                >
                    Set ETH
                </button>
                <button
                    type='button'
                    onClick={() => setCurrency('USD')}
                    className='px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80'
                >
                    Set USD
                </button>
                <button
                    type='button'
                    onClick={() => setCurrency('EUR')}
                    className='px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80'
                >
                    Set EUR
                </button>
            </HStack>
        </VStack>
    )
}

const meta: Meta<typeof HookDemo> = {
    component: HookDemo,
}

export default meta

type Story = StoryObj<typeof HookDemo>

export const Default: Story = {}
