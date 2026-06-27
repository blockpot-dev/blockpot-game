import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    Outlet,
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
} from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'

// Wraps a React subtree in the minimum providers a player-frontend component
// needs to render in isolation:
//   - a fresh QueryClient (retry off, refetchOnWindowFocus off)
//   - an in-memory TanStack Router so <Link> / useNavigate don't blow up
//   - a TooltipProvider for components that render Radix tooltips
//
// Web3 providers (Web3Provider, Web3ConnectionProvider, BlockpotEventsProvider,
// etc.) are intentionally omitted — tests should vi.mock() the wagmi / TanStack
// Query hooks they depend on at the hook boundary rather than wrap the full
// provider stack.
export function renderWithProviders(ui: React.ReactNode) {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
    })
    const rootRoute = createRootRoute({
        component: () => <Outlet />,
    })
    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: () => <>{ui}</>,
    })
    const router = createRouter({
        routeTree: rootRoute.addChildren([indexRoute]),
        history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    return render(
        <QueryClientProvider client={qc}>
            <TooltipProvider>
                <RouterProvider router={router} />
            </TooltipProvider>
        </QueryClientProvider>,
    )
}
