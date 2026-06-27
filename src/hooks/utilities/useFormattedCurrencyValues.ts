import { formatEtherMaxDecimals, formatEtherMaxDecimalsGreedy } from '@/utilities/formatters'
import useNativeCurrency from '../web3/useNativeCurrency'
import useFiatConverter from './useFiatConverter'

type FormattedCurrencyValuesOptions = {
    greedy: boolean
    maxDecimalsNative: number
    maxDecimalsFiat: number
    leadingSignFiat: boolean
}

export default function useFormattedCurrencyValues(value: bigint, opts: Partial<FormattedCurrencyValuesOptions> = {}) {
    const {
        greedy = true,
        maxDecimalsNative = 4,
        maxDecimalsFiat = 2,
        leadingSignFiat = true
    } = opts
    const nativeCurrency = useNativeCurrency()
    const fiatConverter = useFiatConverter({ maxDecimals: maxDecimalsFiat, leadingSign: leadingSignFiat })
    const fiat = fiatConverter(value)
    const nativeFormatted = `${greedy ? formatEtherMaxDecimalsGreedy(value, maxDecimalsNative) : formatEtherMaxDecimals(value, maxDecimalsNative)}`

    return {
        nativeValue: value,
        nativeFormatted,
        fiatFormatted: fiat.formattedValue,
        fiatValue: fiat.value,
        nativeToken: nativeCurrency
    }
}