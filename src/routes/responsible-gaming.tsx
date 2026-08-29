import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const ResponsibleGamingPanel = lazy(
    () => import('@/components/responsible-gaming/ResponsibleGamingPanel'),
)

export const Route = createFileRoute('/responsible-gaming')({
    component: ResponsibleGamingPage,
})

function ResponsibleGamingPage() {
    return (
        <Suspense fallback={
            <div className='flex flex-1 items-center justify-center py-16 text-secondary-foreground' role='status'>
                Loading responsible gaming…
            </div>
        }>
            <ResponsibleGamingPanel />
        </Suspense>
    )
}
