import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Storybook-only helpers. Tests and prod code use the real providers from
// src/routes/__root.tsx and src/providers/QueryClientProvider.tsx.

export function buildQueryClient(seed?: (qc: QueryClient) => void): QueryClient {
    const qc = new QueryClient({
        defaultOptions: {
            queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
            mutations: { retry: false },
        },
    })
    seed?.(qc)
    return qc
}

export function StoryProviders({ queryClient, children }: { queryClient: QueryClient, children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
