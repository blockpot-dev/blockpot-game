import { formatEtherMaxDecimalsGreedy } from '@/utilities/formatters'
import { formatEurFromMinor } from '@/utilities/formatEur'
import useFiatConverter from './useFiatConverter'
import useWeiToEurMinor from './useWeiToEurMinor'
import type { DisplayCurrency } from './useDisplayCurrency'

export type DisplayPrices = {
    eth: string
    usd: string
    eur: string | null
    eurAvailable: boolean
}

// Returns all three formatted price strings for a given wei amount, so the
// EntryCost tooltip can list ETH / USD / EUR side-by-side and the badge can
// pick whichever the user has cycled to. EUR resolves to `null` (and
// `eurAvailable: false`) on chains where the EUR/USD feed is unwired (today:
// every chain except LOCAL), so callers can omit it from the cycle.
export default function useDisplayPrices(weiAmount: bigint): DisplayPrices {
    const usdConvert = useFiatConverter({ maxDecimals: 2, leadingSign: true })
    const eurMinor = useWeiToEurMinor(weiAmount)

    const eth = formatEtherMaxDecimalsGreedy(weiAmount, 6)
    const usd = usdConvert(weiAmount).formattedValue
    const eur = eurMinor === null ? null : formatEurFromMinor(Number(eurMinor))

    return { eth, usd, eur, eurAvailable: eurMinor !== null }
}

// Resolves the available cycle for the badge — always includes ETH and USD,
// includes EUR only when the EUR feed resolves on the current chain.
export function availableCurrenciesFor(prices: DisplayPrices): DisplayCurrency[] {
    return prices.eurAvailable ? ['ETH', 'USD', 'EUR'] : ['ETH', 'USD']
}
