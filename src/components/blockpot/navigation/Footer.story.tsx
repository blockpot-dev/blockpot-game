import { Meta, StoryObj } from '@storybook/react'
import { createMemoryHistory } from '@tanstack/history'
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import Footer from './Footer'

const rootRoute = createRootRoute({ component: Footer })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => null })
const playRoute = createRoute({ getParentRoute: () => rootRoute, path: '/play', component: () => null })
const howToPlayRoute = createRoute({ getParentRoute: () => rootRoute, path: '/how-to-play', component: () => null })
const transparencyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/transparency', component: () => null })
const responsibleGamingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/responsible-gaming', component: () => null })
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/terms', component: () => null })
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/privacy', component: () => null })
const cookiesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cookies', component: () => null })

const routeTree = rootRoute.addChildren([
    indexRoute,
    playRoute,
    howToPlayRoute,
    transparencyRoute,
    responsibleGamingRoute,
    termsRoute,
    privacyRoute,
    cookiesRoute,
])

function FooterRouterHost() {
    const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    return <RouterProvider router={router} />
}

const meta: Meta<typeof FooterRouterHost> = {
    component: FooterRouterHost,
}
export default meta
type Story = StoryObj<typeof FooterRouterHost>

export const Default: Story = {}
