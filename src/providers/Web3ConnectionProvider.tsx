import { ReactNode, createContext, useContext } from 'react'
import useAccountConnected from '@/hooks/web3/useAccountConnected'

type Web3ConnectionContextType = {
    isConnected: boolean
}

const Web3ConnectionContext = createContext<Web3ConnectionContextType>({
    isConnected: false
})

export type Web3ConnectionProviderProps = {
    children: ReactNode
}

export default function Web3ConnectionProvider(props: Web3ConnectionProviderProps) {
    const isConnected = useAccountConnected()
    const web3Context = {
        isConnected
    }

    return (
        <Web3ConnectionContext.Provider value={web3Context}>
            {props.children}
        </Web3ConnectionContext.Provider>
    )
}

export function useConnected() {
    return useContext(Web3ConnectionContext)
}