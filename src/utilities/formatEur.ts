// EUR formatter for *EUR-minor* values read on-chain via the LGO lifetime
// counters (PlayerActivityState.cumEnteredEurMinor, .cumWonEurMinor,
// .pendingCddEurMinor) and the pretx gate's `pendingCddEurMinor`. Always
// EUR — distinct from the existing USD/native ETH formatters that operate
// on Chainlink-fed wei.

const formatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
})

export function formatEurFromMinor(minor: number): string {
    return formatter.format(minor / 100)
}
