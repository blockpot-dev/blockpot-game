import { ReactNode, useEffect, useState } from 'react'
import type { Transport } from 'viem'
import { WagmiProvider, createConfig, http, webSocket } from 'wagmi'
import { Chain, hardhat, mainnet } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
if (!projectId) {
    throw new Error('VITE_WALLETCONNECT_PROJECT_ID is required but not set')
}

const testnetRpcUrl = import.meta.env.VITE_TESTNET_RPC_URL
const testnetChainId = Number(import.meta.env.VITE_TESTNET_CHAIN_ID ?? 69696)

function deriveTestnetWsUrl(httpUrl: string | undefined): string | undefined {
    if (!httpUrl) return undefined
    if (httpUrl.startsWith('https://')) return 'wss://' + httpUrl.slice('https://'.length)
    if (httpUrl.startsWith('http://')) return 'ws://' + httpUrl.slice('http://'.length)
    return httpUrl
}

const testnetWsUrl = deriveTestnetWsUrl(testnetRpcUrl)

const blockPotTestnet: Chain = {
    id: testnetChainId,
    nativeCurrency: {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18
    },
    name: 'Blockpot Testnet',
    rpcUrls: {
        default: {
            http: testnetRpcUrl ? [testnetRpcUrl] : [],
            webSocket: testnetWsUrl ? [testnetWsUrl] : []
        },
        public: {
            http: testnetRpcUrl ? [testnetRpcUrl] : [],
            webSocket: testnetWsUrl ? [testnetWsUrl] : []
        }
    }
}

const metadata = {
    name: 'Blockpot',
    description: 'The people\'s lottery',
    url: 'https://blockpot.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886'] // TODO: Change me
}

const appMode = import.meta.env.VITE_APP_MODE
console.log('appMode', appMode)

if (appMode === 'STAGING' && !testnetRpcUrl) {
    throw new Error('VITE_TESTNET_RPC_URL is required when VITE_APP_MODE=STAGING')
}

export const chains = appMode === 'STAGING'
    ? [blockPotTestnet, mainnet] as const
    : [hardhat] as const

const transports: Record<number, Transport> = appMode === 'STAGING'
    ? {
        [blockPotTestnet.id]: webSocket(),
        [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC_URL)
    }
    : {
        [hardhat.id]: webSocket('ws://localhost:8545', { reconnect: true })
    }

const wagmiConfig = createConfig({
    chains,
    transports,
    connectors: [
        walletConnect({ projectId, metadata, showQrModal: false }),
        injected({ shimDisconnect: true }),
    ],
})

export type Web3ProviderProps = {
    children: ReactNode
}

export default function Web3Provider(props: Web3ProviderProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <WagmiProvider config={wagmiConfig}>
            {mounted && props.children}
        </WagmiProvider>
    )
}