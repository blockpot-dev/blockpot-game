import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const Transparency = lazy(() => import('@/components/blockpot/transparency'))

type TransparencySearch = {
    round?: number
}

export const Route = createFileRoute('/transparency')({
    component: TransparencyPage,
    validateSearch: (search: Record<string, unknown>): TransparencySearch => {
        const rawRound = Number(search.round)
        return {
            round: Number.isInteger(rawRound) && rawRound >= 0 ? rawRound : undefined,
        }
    },
})

function TransparencyPage() {
    return (
        <Transparency />
    )
}
