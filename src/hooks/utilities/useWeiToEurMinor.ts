import { useNativeCurrencyToUSDPrice } from '@/hooks/contracts/chainlink/useNativeCurrencyToUSDPrice'
import { useEurToUSDPrice } from '@/hooks/contracts/chainlink/useEurToUSDPrice'

// Mirrors `LGO._priceWeiEur`'s formula client-side:
//   eur8 = (weiAmount * ethUsd) / (eurUsd * 1e10)
//   eurMinor = eur8 / 1e6
// Returns `null` when either feed is missing (e.g. the EUR/USD feed isn't
// wired on the current chain — today every chain except LOCAL) so callers
// can fall back to other gates rather than blocking on a half-configured
// network.
export default function useWeiToEurMinor(weiAmount: bigint): bigint | null {
    const ethUsd = useNativeCurrencyToUSDPrice()
    const eurUsd = useEurToUSDPrice()

    if (ethUsd.bigNumber === 0n || eurUsd.bigNumber === 0n) return null
    if (weiAmount === 0n) return 0n

    // Normalise feed decimals to a common 1e8 base before dividing — chainlink
    // mainnet feeds are 1e8, but a mock might publish at a different scale.
    const ethScaled = ethUsd.decimals === 8
        ? ethUsd.bigNumber
        : (ethUsd.bigNumber * 10n ** 8n) / 10n ** BigInt(ethUsd.decimals)
    const eurScaled = eurUsd.decimals === 8
        ? eurUsd.bigNumber
        : (eurUsd.bigNumber * 10n ** 8n) / 10n ** BigInt(eurUsd.decimals)

    const eur8 = (weiAmount * ethScaled) / (eurScaled * 10n ** 10n)
    return eur8 / 10n ** 6n
}
