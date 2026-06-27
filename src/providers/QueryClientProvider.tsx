import React from 'react'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createIDBPersister } from '@/utilities/query/idb-persister'

const persister = createIDBPersister()

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retryOnMount: true,
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
        },
    }
})

function Providers({ children }: React.PropsWithChildren) {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{persister: persister, buster: 'v6'}}
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['lotteryState'] })
                queryClient.invalidateQueries({ queryKey: ['currentRoundEntryIndexes'] })
                queryClient.invalidateQueries({ queryKey: ['roundPurchases'] })
                queryClient.invalidateQueries({ queryKey: ['specificRound'] })
            }}
        >
            {children}
            <ReactQueryDevtools initialIsOpen={true} />
        </PersistQueryClientProvider>
    )
}

export default Providers