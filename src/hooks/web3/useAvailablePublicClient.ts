import { usePublicClient } from 'wagmi'

export default function useAvailablePublicClient() {
    const publicClient = usePublicClient()

    if (!publicClient) { throw 'useAvailablePublicClient should only be used within a WagmiProvider' }
    return publicClient
}