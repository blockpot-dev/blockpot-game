import { getClientLocale } from './locale'

function getDecimalSeparator(locale: string) {
    const numberWithDecimalSeparator: number = 1.1
    return Intl.NumberFormat(locale)
        .formatToParts(numberWithDecimalSeparator)
        .find(part => part.type === 'decimal')?.value ?? '.'
}

function getGroupSeparator(locale: string) {
    const value: number = 1000
    return Intl.NumberFormat(locale)
        .formatToParts(value)
        .find(part => part.type === 'group')?.value ?? '.'
}

function getZero(locale: string) {
    return Intl.NumberFormat(locale)
        .format(0)
}

export const DECIMAL_SEPARATOR = getDecimalSeparator(getClientLocale() ?? 'en')
export const GROUP_SEPARATOR = getGroupSeparator(getClientLocale() ?? 'en')
const zero = getZero(getClientLocale() ?? 'en')

export function autoDecimals(numberString: string, maxDecimals?: number): number {
    const separatorIndex = numberString.indexOf(DECIMAL_SEPARATOR)
    let decimals: number
    if (separatorIndex !== -1) {
        let currentIndex = separatorIndex
        let foundNonZero = false
        while (currentIndex + 1 < numberString.length && (!foundNonZero || numberString[currentIndex + 1] != zero)) {
            if (!foundNonZero) {
                foundNonZero = numberString[currentIndex + 1] != zero
            }
            currentIndex += 1
        }

        if (foundNonZero) {
            decimals = currentIndex - separatorIndex
        } else {
            return 0
        }
    } else {
        decimals = 0
    }
    return Math.min(decimals, maxDecimals ?? 4)
}

export function autoDecimalsGreedy(numberString: string, targetDecimals: number = 4): number {
    const separatorIndex = numberString.indexOf(DECIMAL_SEPARATOR)
    let decimals: number
    if (separatorIndex !== -1) {
        let currentIndex = Math.min(separatorIndex + targetDecimals, numberString.length - 1)
        while (numberString[currentIndex] === zero && currentIndex > separatorIndex) {
            currentIndex -= 1
        }
        decimals = currentIndex - separatorIndex
    } else {
        decimals = 0
    }
    return decimals
}
