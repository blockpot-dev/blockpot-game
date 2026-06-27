export type Amounts = {
    amount: bigint
    amountFormatted: string
    fiat: bigint
    fiatFormatted: string
    nativeToken: string
}

export const DEFAULT_AMOUNTS: Amounts = {
    amount: 0n,
    amountFormatted: '0',
    fiat: 0n,
    fiatFormatted: '0',
    nativeToken: 'ETH'
}