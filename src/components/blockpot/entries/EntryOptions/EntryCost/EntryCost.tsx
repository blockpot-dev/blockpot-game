import { useEffect } from 'react'
import HStack from '@/components/core/HStack/HStack'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import useDisplayCurrency from '@/hooks/utilities/useDisplayCurrency'
import useDisplayPrices, { availableCurrenciesFor } from '@/hooks/utilities/useDisplayPrices'
import { Amounts } from '@/types/draw/tokens'
import { TooltipArrow } from '@radix-ui/react-tooltip'

export type EntryCostProps = {
    entryCost: Amounts
}

export default function EntryCost(props: EntryCostProps) {
    const { entryCost } = props
    const { currency, cycle, setCurrency } = useDisplayCurrency()
    const prices = useDisplayPrices(entryCost.amount)
    const available = availableCurrenciesFor(prices)

    useEffect(() => {
        if (!available.includes(currency)) {
            setCurrency('ETH')
        }
    }, [available, currency, setCurrency])

    const ethLabel = `${prices.eth} ${entryCost.nativeToken}`
    const usdLabel = `~${prices.usd} USD`
    const eurLabel = prices.eur !== null ? `~${prices.eur} EUR` : null

    const badgeLabel =
        currency === 'USD' ? prices.usd
            : currency === 'EUR' && prices.eur !== null ? prices.eur
                : prices.eth

    const tooltipContent = <div className='inline-block'>
        <span>
            {'Each entry costs '}
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
                        aria-label='Switch price currency'
                        onClick={() => cycle(available)}
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
                                    <img src='/assets/svgs/tokens/eth.svg' alt='ETH' className="w-6 h-6" />
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
