import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const Play = lazy(() => import('@/components/blockpot/play'))

export const Route = createFileRoute('/play')({
    component: PlayPage,
})

function PlayPage() {
    return (
        <Suspense fallback={
            <div className='flex flex-1 items-center justify-center py-16 text-secondary-foreground' role='status'>
                Loading Blockpot…
            </div>
        }>
            <Play />
        </Suspense>
    )
}