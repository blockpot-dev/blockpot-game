import { useCallback, useLayoutEffect, useState } from 'react'

export type ScrollState = { scrollable: boolean; atBottom: boolean };

export default function useScrollState() {
    const [el, setEl] = useState<HTMLDivElement | null>(null)
    const ref = useCallback((node: HTMLDivElement | null) => setEl(node), [])

    const [state, setState] = useState<ScrollState>({
        scrollable: false,
        atBottom: true,
    })

    useLayoutEffect(() => {
        if (!el) return

        const EPS = 1
        const compute = () => {
            const { scrollTop, scrollHeight, clientHeight } = el
            const scrollable = scrollHeight > clientHeight + EPS
            const atBottom = !scrollable || scrollTop + clientHeight >= scrollHeight - EPS
            setState({ scrollable, atBottom })
        }

        compute()

        // Scroll listener
        const onScroll = () => compute()
        el.addEventListener('scroll', onScroll, { passive: true })

        const ro = new ResizeObserver(compute)
        ro.observe(el)

        const mo = new MutationObserver(compute)
        mo.observe(el, { childList: true, subtree: true, characterData: true })

        return () => {
            el.removeEventListener('scroll', onScroll)
            ro.disconnect()
            mo.disconnect()
        }
    }, [el])

    return { ref, ...state }
}