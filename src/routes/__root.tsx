import '@/styles/globals.css'
import '@/styles/tailwind.css'

import React, { lazy, Suspense } from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import ModalOpenStateProvider from '@/providers/ModalOpenStateProvider'
import TransactionsProvider from '@/providers/TransactionsProvider'
import Web3Provider from '@/providers/Web3Provider'
import BlockpotEventsProvider from '@/providers/BlockpotEventsProvider'
import BlockpotProvider from '@/providers/BlockpotProvider'
import QueryClientProvider from '@/providers/QueryClientProvider'
import { SelectedGameProvider } from '@/providers/SelectedGameProvider'
import Header from '@/components/blockpot/header/Header'
import BlockpotDrawProvider from '@/providers/BlockpotDrawProvider'
import Modals from '@/components/blockpot/modals'
import { Toaster } from '@/components/ui/sonner'
import Web3ConnectionProvider from '@/providers/Web3ConnectionProvider'
import Footer from '@/components/blockpot/navigation/Footer'
import CountryProvider from '@/providers/CountryProvider'
import UnsupportedRegionDialog from '@/components/blockpot/modals/UnsupportedRegionDialog'
import MissedDrawProvider from '@/providers/MissedDrawProvider'
import PlayerSessionProvider from '@/providers/PlayerSessionProvider'
import SessionSignalProvider from '@/providers/SessionSignalProvider'
import SessionExpiryRecovery from '@/api/SessionExpiryRecovery'
import LGOWhitelistBanner from '@/components/blockpot/common/LGOWhitelistBanner'
import SelfExclusionBanner from '@/components/responsible-gaming/SelfExclusionBanner'

// Lazy load the dev tools only in development
const TanStackRouterDevtools = import.meta.env.PROD
    ? () => null
    : lazy(() =>
        import('@tanstack/router-devtools').then((module) => ({
            default: module.TanStackRouterDevtools,
        }))
    )

export const Route = createRootRoute({
    component: () => (
        <>
            <CountryProvider>
                <QueryClientProvider>
                    <Web3Provider>
                        <Web3ConnectionProvider>
                            <PlayerSessionProvider>
                                <SessionExpiryRecovery />
                                <SessionSignalProvider>
                                    <TransactionsProvider>
                                        <SelectedGameProvider>
                                            <ModalOpenStateProvider>
                                                <BlockpotEventsProvider>
                                                    <BlockpotProvider>
                                                        <MissedDrawProvider>
                                                            <BlockpotDrawProvider>
                                                                {/* <SettingsProvider> */}
                                                                <Modals />
                                                                <div style={{ width: '100%', height: '100%' }}>
                                                                    <div className="app-shell">
                                                                        <div className='flex flex-col h-full'>
                                                                            <Header />
                                                                            <LGOWhitelistBanner />
                                                                            <SelfExclusionBanner />
                                                                            <div className='relative overflow-auto flex flex-col flex-1'>
                                                                                <div className="absolute top-0 left-0 w-full lg:h-full overflow-hidden z-[-1]">
                                                                                    <img
                                                                                        src="/assets/svgs/grid.svg"
                                                                                        width={2482}
                                                                                        height={1072}
                                                                                        alt=""
                                                                                        className="absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-10%] object-cover w-[2482px] h-[1072px] z-[-2]"
                                                                                    />
                                                                                </div>
                                                                                <Suspense fallback={
                                                                                    <div className="flex flex-1 items-center justify-center">
                                                                                        <Loader2 className="animate-spin h-8 w-8" />
                                                                                    </div>
                                                                                }>
                                                                                    <Outlet />
                                                                                </Suspense>
                                                                                <Footer />
                                                                            </div>
                                                                            {/* <BottomNavigation /> */}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* </SettingsProvider> */}
                                                            </BlockpotDrawProvider>
                                                        </MissedDrawProvider>
                                                    </BlockpotProvider>
                                                </BlockpotEventsProvider>
                                            </ModalOpenStateProvider>
                                        </SelectedGameProvider>
                                    </TransactionsProvider>
                                </SessionSignalProvider>
                            </PlayerSessionProvider>
                        </Web3ConnectionProvider>
                    </Web3Provider>
                </QueryClientProvider>
                <UnsupportedRegionDialog />
            </CountryProvider>
            <Toaster position='bottom-right' theme='dark' />
            {!import.meta.env.PROD && (
                <Suspense fallback={null}>
                    <TanStackRouterDevtools />
                </Suspense>
            )}
        </>
    ),
})