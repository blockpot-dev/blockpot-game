import { formatEther, formatUnits } from 'viem'
import { autoDecimals, autoDecimalsGreedy } from './decimals'
import { getClientLocale } from './locale'

const locale = getClientLocale()
export function formatCurrency(amount: number, maximumFractionDigits: number = 0) {
    const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits})
    return currencyFormatter.format(amount)
}

export function formatPercentage(value: number) {
    return `${(value * 100).toFixed(2)}%`
}

const sqftFormatter = new Intl.NumberFormat(getClientLocale() , { style: 'decimal', maximumFractionDigits: 0})
export function formatSqft(amount: number) {
    return sqftFormatter.format(amount) + ' sqft'
}

export function formatNumber(amount: number | bigint, maximumFractionDigits: number = 0) {
    const numberFormatter = Intl.NumberFormat(undefined, { maximumFractionDigits, minimumFractionDigits: maximumFractionDigits })
    return numberFormatter.format(amount)
}

export function countDigits(value: number | bigint): number {
    if (typeof value === 'bigint') {
        return String(value).replace('-', '').length
    }
    return Math.abs(Math.trunc(value)).toString().length
}

// Each step keeps "9…9" within ~140px at bold sans-serif on a 252px-wide ticket.
export function getDrawnNumberFontSizePx(digits: number): number {
    if (digits <= 6) return 30
    if (digits === 7) return 23
    if (digits === 8) return 21
    if (digits === 9) return 19
    if (digits === 10) return 17
    return 16
}

export function formatUSDCurrency(amount: number | bigint, maximumFractionDigits: number = 0, leadingSign: boolean = false) {
    const numberFormatter = Intl.NumberFormat(undefined, { maximumFractionDigits, minimumFractionDigits: maximumFractionDigits })
    return (leadingSign ? '$' : '') + numberFormatter.format(amount) + (leadingSign ? '' : ' USD')
}

export function formatAccountAddress(address: string, leadingLength: number = 2, trailingLength: number = 4) {
    return `${address.substring(0, 2 + leadingLength)}...${address.substring(address.length - trailingLength, address.length)}`
}

export function formatFixedMaxDecimals(value: bigint, decimals: number, maxDecimals: number) {
    const formattedValue = formatUnits(value, decimals)
    const currentDecimals = autoDecimals(parseFloat(formattedValue).toFixed(maxDecimals), maxDecimals)
    return parseFloat(formattedValue).toFixed(currentDecimals)
}

export function formatFixedMaxDecimalsGreedy(value: bigint, decimals: number, maxDecimals: number) {
    const formattedValue = formatUnits(value, decimals)
    const currentDecimals = autoDecimalsGreedy(parseFloat(formattedValue).toFixed(maxDecimals), maxDecimals)
    return parseFloat(formattedValue).toFixed(currentDecimals)
}

export function formatEtherMaxDecimals(value: bigint, maxDecimals: number) {
    const formattedValue = formatEther(value)
    const currentDecimals = autoDecimals(parseFloat(formattedValue).toFixed(maxDecimals), maxDecimals)
    return parseFloat(formatEther(value)).toFixed(currentDecimals)
}

export function formatEtherMaxDecimalsGreedy(value: bigint, targetDecimals: number) {
    const formattedValue = formatEther(value)
    const currentDecimals = autoDecimalsGreedy(parseFloat(formattedValue).toFixed(targetDecimals), targetDecimals)
    return parseFloat(formatEther(value)).toFixed(currentDecimals)
}

export function formatNumberMaxDecimalsGreedy(value: number, decimals: number, maxDecimals: number) {
    const formattedValue = value.toFixed(decimals)
    const currentDecimals = autoDecimalsGreedy(formattedValue, maxDecimals)
    return value.toFixed(currentDecimals)
}

export const COMPACT_THRESHOLD = 1000

export function shouldCompact(value: number): boolean {
    return value >= COMPACT_THRESHOLD
}

export function formatCompactNumber(value: number): string {
    if (value < COMPACT_THRESHOLD) return formatNumber(value, 0)
    if (value < 1_000_000) return `${(value / 1000).toFixed(1)}K`
    return `${(value / 1_000_000).toFixed(1)}M`
}

