import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const Transparency = lazy(() => import('@/components/blockpot/transparency'))

import { GameType } from '@/providers/SelectedGameProvider'

type TransparencySearch = {
    round?: number
    game?: GameType
}

export const Route = createFileRoute('/transparency')({
    component: TransparencyPage,
    validateSearch: (search: Record<string, unknown>): TransparencySearch => {
        const rawRound = Number(search.round)
        const rawGame = search.game
        return {
            round: Number.isInteger(rawRound) && rawRound >= 0 ? rawRound : undefined,
            game: rawGame === 'main' || rawGame === 'quick' ? rawGame : undefined,
        }
    },
})

function TransparencyPage() {
    return (
        <Transparency />
    )
}
