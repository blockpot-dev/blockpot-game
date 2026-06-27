import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const ResponsibleGamingPanel = lazy(
    () => import('@/components/responsible-gaming/ResponsibleGamingPanel'),
)

export const Route = createFileRoute('/responsible-gaming')({
    component: ResponsibleGamingPage,
})

function ResponsibleGamingPage() {
    return <ResponsibleGamingPanel />
}
