import { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TooltipArrow } from '@radix-ui/react-tooltip'
import { Amounts, DEFAULT_AMOUNTS } from '@/types/lottery/tokens'
import type { DisplayCurrency } from '@/hooks/utilities/useDisplayCurrency'
import type { DisplayPrices } from '@/hooks/utilities/useDisplayPrices'

// Storybook-only reproduction of EntryCost's render with controlled state.
// The real component pulls `currency` and `prices` from wagmi-backed hooks
// (chainId-, chain-feed-, and provider-dependent). To exercise the render
// cases without wiring a full Web3Provider stack, we mirror the JSX here and
// feed it explicit values.
type EntryCostStoryViewProps = {
    entryCost: Amounts
    currency: DisplayCurrency
    prices: DisplayPrices
    onCycle: () => void
    onAutoCorrect?: () => void
}

function availableCurrenciesFor(prices: DisplayPrices): DisplayCurrency[] {
    return prices.eurAvailable ? ['ETH', 'USD', 'EUR'] : ['ETH', 'USD']
}

function EntryCostStoryView(props: EntryCostStoryViewProps) {
    const { entryCost, currency, prices, onCycle, onAutoCorrect } = props
    const available = availableCurrenciesFor(prices)

    useEffect(() => {
        if (!available.includes(currency) && onAutoCorrect) {
            onAutoCorrect()
        }
    }, [available, currency, onAutoCorrect])

    const ethLabel = `${prices.eth} ${entryCost.nativeToken}`
    const usdLabel = `~${prices.usd} USD`
    const eurLabel = prices.eur !== null ? `~${prices.eur} EUR` : null

    const badgeLabel =
        currency === 'USD' ? prices.usd
            : currency === 'EUR' && prices.eur !== null ? prices.eur
                : prices.eth

    const tooltipContent = <div className='inline-block'>
        <span>
            {'Each ticket costs '}
            <span className='font-bold whitespace-nowrap'>{ethLabel}</span>
            {' or '}
            <span className='font-bold whitespace-nowrap'>{usdLabel}</span>
            {eurLabel !== null && (
                <>
                    {' or '}
                    <span className='font-bold whitespace-nowrap'>{eurLabel}</span>
                </>
            )}
        </span>
    </div>

    return (
        <HStack>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type='button'
                        onClick={onCycle}
                        className='rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-foreground'
                    >
                        <HStack className='relative gap-1.5 items-center before:absolute before:-inset-y-1 before:-inset-x-2 before:rounded-md before:transition-colors before:duration-300 before:z-[-1] hover:before:bg-gray-800/50 '>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill='none' className='text-secondary-foreground'>
                                <path d="M8.0001 7.99961L8.0001 11.1996M8.0001 5.62773V5.59961M1.6001 7.99961C1.6001 4.46499 4.46548 1.59961 8.0001 1.59961C11.5347 1.59961 14.4001 4.46499 14.4001 7.99961C14.4001 11.5342 11.5347 14.3996 8.0001 14.3996C4.46547 14.3996 1.6001 11.5342 1.6001 7.99961Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <HStack className='gap-1.5 items-center min-h-6'>
                                <span className='text-sm text-secondary-foreground leading-[0.8]'>
                                    {'Price: '}
                                    <span className='text-foreground font-bold'>{badgeLabel}</span>
                                </span>
                                {currency === 'ETH' && (
                                    <img src='/assets/svgs/tokens/eth.svg' alt='ETH' className='w-6 h-6' />
                                )}
                            </HStack>
                        </HStack>
                    </button>
                </TooltipTrigger>
                <TooltipContent side='top'>
                    <div className='bg-gray-800 px-4 py-2 text-sm rounded-md w-[220px]'>{tooltipContent}</div>
                    <TooltipArrow width={12} height={6} className='fill-gray-800 translate-y-[-100%]' />
                </TooltipContent>
            </Tooltip>
        </HStack>
    )
}

const ENTRY_COST: Amounts = {
    ...DEFAULT_AMOUNTS,
    amount: 1_000_000_000_000_000n,
    amountFormatted: '0.001',
    fiat: 0n,
    fiatFormatted: '$1.68',
    nativeToken: 'ETH',
}

const PRICES_WITH_EUR: DisplayPrices = {
    eth: '0.001',
    usd: '$1.68',
    eur: '€1.55',
    eurAvailable: true,
}

const PRICES_NO_EUR: DisplayPrices = {
    eth: '0.001',
    usd: '$1.68',
    eur: null,
    eurAvailable: false,
}

const meta: Meta<typeof EntryCostStoryView> = {
    component: EntryCostStoryView,
    parameters: {
        layout: 'centered',
    },
}

export default meta

type Story = StoryObj<typeof EntryCostStoryView>

export const EthSelectedEurAvailable: Story = {
    render: () => (
        <VStack className='gap-4'>
            <span className='text-xs text-secondary-foreground'>ETH on the badge — tooltip shows ETH / USD / EUR.</span>
            <EntryCostStoryView
                entryCost={ENTRY_COST}
                currency='ETH'
                prices={PRICES_WITH_EUR}
                onCycle={() => { /* story: noop */ }}
            />
        </VStack>
    ),
}

export const UsdSelectedEurAvailable: Story = {
    render: () => (
        <VStack className='gap-4'>
            <span className='text-xs text-secondary-foreground'>USD on the badge — tooltip shows ETH / USD / EUR.</span>
            <EntryCostStoryView
                entryCost={ENTRY_COST}
                currency='USD'
                prices={PRICES_WITH_EUR}
                onCycle={() => { /* story: noop */ }}
            />
        </VStack>
    ),
}

export const EurSelectedEurAvailable: Story = {
    render: () => (
        <VStack className='gap-4'>
            <span className='text-xs text-secondary-foreground'>EUR on the badge — tooltip shows ETH / USD / EUR.</span>
            <EntryCostStoryView
                entryCost={ENTRY_COST}
                currency='EUR'
                prices={PRICES_WITH_EUR}
                onCycle={() => { /* story: noop */ }}
            />
        </VStack>
    ),
}

export const EthSelectedNoEurFeed: Story = {
    render: () => (
        <VStack className='gap-4'>
            <span className='text-xs text-secondary-foreground'>EUR feed unwired (e.g. blockpot-testnet) — tooltip omits EUR; cycle is ETH ↔ USD.</span>
            <EntryCostStoryView
                entryCost={ENTRY_COST}
                currency='ETH'
                prices={PRICES_NO_EUR}
                onCycle={() => { /* story: noop */ }}
            />
        </VStack>
    ),
}

// Demonstrates the auto-correction path: badge mounts with a stale EUR
// preference on a chain where the EUR feed is not wired. The view fires
// `onAutoCorrect` once, which flips `currency` back to ETH on next render.
// EUR is never observably the badge value because the auto-correct effect
// runs synchronously after mount.
export const EurSelectedButFeedUnavailableAutoCorrects: Story = {
    render: () => {
        const [currency, setCurrency] = useState<DisplayCurrency>('EUR')
        return (
            <VStack className='gap-4'>
                <span className='text-xs text-secondary-foreground'>
                    EUR stored in localStorage but feed unavailable — auto-corrects to ETH.
                    Current state: <span className='font-mono'>{currency}</span>
                </span>
                <EntryCostStoryView
                    entryCost={ENTRY_COST}
                    currency={currency}
                    prices={PRICES_NO_EUR}
                    onCycle={() => { /* story: noop */ }}
                    onAutoCorrect={() => setCurrency('ETH')}
                />
            </VStack>
        )
    },
}
