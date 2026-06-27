import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const Play = lazy(() => import('@/components/blockpot/play'))

export const Route = createFileRoute('/play')({
    component: PlayPage,
})

function PlayPage() {
    return (
        <Play />
    )
}