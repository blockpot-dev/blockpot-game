import { usePrevious } from '@/hooks/utilities/usePrevious'
import { useEffect } from 'react'

export function useChanged<T>(current: T) {
    const previous = usePrevious(current)
    if (previous == undefined) {
        return false
    }
    return previous !== current
}

export function useTriggerOnChanged<T>(current: T, trigger: () => void) {
    const changed = useChanged(current)
    useEffect(() => {
        if (changed) {
            trigger()
        }
    }, [changed, trigger])
}