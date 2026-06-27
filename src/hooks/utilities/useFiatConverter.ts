import { formatUSDCurrency } from '@/utilities/formatters'
import { convert, useNativeCurrencyToUSDPrice } from '../contracts/chainlink/useNativeCurrencyToUSDPrice'
import { formatUnits } from 'viem'

export type FiatConverterOptions = {
    maxDecimals: number
    leadingSign: boolean
}

export type FiatConversionResult = {
    value: bigint
    formattedValue: string
}


export default function useFiatConverter(opts: Partial<FiatConverterOptions> = {}): (ethAmount: bigint) => FiatConversionResult {
    const priceInfo = useNativeCurrencyToUSDPrice()
    const {
        maxDecimals = 2,
        leadingSign = true
    } = opts
    return (ethAmount: bigint) => {
        const fiatValue = convert(ethAmount, priceInfo)
        return {
            value: fiatValue,
            formattedValue: formatUSDCurrency(parseFloat(formatUnits(fiatValue, 18)), maxDecimals, leadingSign)
        }
    }
}

export type FiatConverter = ReturnType<typeof useFiatConverter>