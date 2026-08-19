// Forward-looking mirror of the operator's `_priceWeiEur` conversion. Returns the
// EUR-minor amount a wei figure would price to under the current Chainlink
// feeds, or null when either feed is missing (e.g. EUR/USD isn't wired
// locally) so callers fall back to the on-chain / server-side gate rather
// than blocking on a half-configured env.
export default function priceWeiEurMinor(
    weiAmount: bigint,
    ethUsd: { bigNumber: bigint, decimals: number },
    eurUsd: { bigNumber: bigint, decimals: number },
): bigint | null {
    if (ethUsd.bigNumber === 0n || eurUsd.bigNumber === 0n) return null
    if (weiAmount === 0n) return 0n

    const ethScaled = ethUsd.decimals === 8
        ? ethUsd.bigNumber
        : (ethUsd.bigNumber * 10n ** 8n) / 10n ** BigInt(ethUsd.decimals)
    const eurScaled = eurUsd.decimals === 8
        ? eurUsd.bigNumber
        : (eurUsd.bigNumber * 10n ** 8n) / 10n ** BigInt(eurUsd.decimals)

    const eur8 = (weiAmount * ethScaled) / (eurScaled * 10n ** 10n)
    return eur8 / 10n ** 6n
}
