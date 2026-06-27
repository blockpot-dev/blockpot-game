import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const Transparency = lazy(() => import('@/components/blockpot/transparency'))

export const Route = createFileRoute('/transparency')({
    component: TransparencyPage,
})

function TransparencyPage() {
    return (
        <Transparency />
    )
}