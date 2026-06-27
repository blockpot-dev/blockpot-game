import { Meta, StoryObj } from '@storybook/react'
import { createMemoryHistory } from '@tanstack/history'
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { KycVerificationContent } from './KycVerificationView'
import { PlayerKycStatus } from '@/hooks/player/usePlayerKyc'
import { buildQueryClient, StoryProviders } from './_storyHelpers'

// Stories drive `KycVerificationContent` directly so the targetTier-vs-onChainTier
// branching is exercisable without a wagmi provider or a live gaming-service.
// `RouterProvider` is required because the terminal panel uses `useNavigate`
// from @tanstack/react-router. The pre-verification + age-rejection branches
// still mount SumsubSdkHost, which surfaces its own InfoBanner in storybook
// because there is no /v1/kyc/token backend.

const rootRoute = createRootRoute()
const playRoute = createRoute({ getParentRoute: () => rootRoute, path: '/play', component: () => null })
const verifyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/verify', component: () => null })
const routeTree = rootRoute.addChildren([playRoute, verifyRoute])

function StoryRouterProvider({ children }: { children: React.ReactNode }) {
    const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: ['/verify'] }),
        defaultComponent: () => <>{children}</>,
    })
    return <RouterProvider router={router} />
}

const meta: Meta<typeof KycVerificationContent> = {
    component: KycVerificationContent,
    decorators: [
        (Story) => (
            <StoryProviders queryClient={buildQueryClient()}>
                <StoryRouterProvider>
                    <div className='max-w-[820px] mx-auto p-4'>
                        <Story />
                    </div>
                </StoryRouterProvider>
            </StoryProviders>
        ),
    ],
}
export default meta
type Story = StoryObj<typeof KycVerificationContent>

const noop = () => { /* storybook */ }

const allPending: PlayerKycStatus = {
    currentTier: 'T0',
    gates: {
        photo_id: { status: 'pending' },
        proof_of_address: { status: 'pending' },
    },
    pendingCddEurMinor: 0,
}

const ageRejected: PlayerKycStatus = {
    currentTier: 'T0',
    gates: {
        photo_id: { status: 'failed', rejectionReason: 'Applicant under 18' },
    },
    pendingCddEurMinor: 0,
}

// Target T2 with on-chain tier T0 — the SumSub iframe slot renders below the
// banner row. The host can't reach the gaming-service in storybook so it
// surfaces its own InfoBanner instead of the live iframe.
export const PreVerification: Story = {
    args: {
        targetTier: 'T2',
        status: allPending,
        onChainTier: 'T0',
        onRefresh: noop,
    },
}

// Target T2 with on-chain tier T2 — terminal panel is the only thing rendered.
export const AlreadyComplete: Story = {
    args: {
        targetTier: 'T2',
        status: undefined,
        onChainTier: 'T2',
        onRefresh: noop,
    },
}

// Target T1 with photo_id failed for an under-18 applicant — the
// AgeRejectionBanner is visible above the SumSub host slot.
export const AgeRejection: Story = {
    args: {
        targetTier: 'T1',
        status: ageRejected,
        onChainTier: 'T0',
        onRefresh: noop,
    },
}
