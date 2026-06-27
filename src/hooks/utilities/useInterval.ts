import { useEffect, useRef, useState } from 'react'

interface UseIntervalOptions {
  /** If set, the interval will start automatically when the component is mounted, `false` by default */
  autoInvoke?: boolean;
}

export function useInterval(
    fn: () => void,
    interval: number,
    { autoInvoke = false }: UseIntervalOptions = {}
) {
    const [active, setActive] = useState(false)
    const intervalRef = useRef<number | undefined>(undefined)
    const fnRef = useRef<(() => void) | undefined>(undefined)

    const start = () => {
        setActive((old) => {
            if (!old && !intervalRef.current) {
                intervalRef.current = window.setInterval(fnRef.current!, interval)
            }
            return true
        })
    }

    const stop = () => {
        setActive(false)
        window.clearInterval(intervalRef.current)
        intervalRef.current = undefined
    }

    const toggle = () => {
        if (active) {
            stop()
        } else {
            start()
        }
    }

    useEffect(() => {
        fnRef.current = fn
        if (active) start()
        return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fn, active, interval])

    useEffect(() => {
        if (autoInvoke) {
            start()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { start, stop, toggle, active }
}