import { filterNonNumeric } from '@/utilities/strings'
import { useState } from 'react'

export type NumberStateOptions = {
    defaultValue?: number
}

const EMPTY_VALUE = Number.MIN_SAFE_INTEGER

export default function useNumberState(options?: NumberStateOptions) {
    const [value, setRawValue] = useState(options?.defaultValue ??EMPTY_VALUE)

    const stringValue = value !== EMPTY_VALUE ? value.toString() : ''
    const setValue = (stringValue: string) => {
        const filteredValue = filterNonNumeric(stringValue)
        if (filteredValue.length === 0) {
            setRawValue(EMPTY_VALUE)
        } else {
            setRawValue(parseInt(filteredValue))
        }
    }
    return {
        value,
        setValue,
        stringValue
    }
}