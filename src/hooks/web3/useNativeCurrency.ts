import { useChainId } from 'wagmi'
import { NetworkId } from '../../constants/network-details'

export default function useNativeCurrency() {
    const chainId = useChainId()
    return {
        [NetworkId.LOCAL]: 'ETH',
        [NetworkId.POLYGON_TESTNET]: 'MATIC',
        [NetworkId.ARBITRUM_TESTNET]: 'ETH',
        [1]: 'ETH',
        [5]: 'ETH',
        [69696]: 'ETH'
    }[chainId] ?? ''
}

export const NETWORK_BADGES: { [key: number]: string} = {
    [NetworkId.LOCAL]: 'eth',
    [NetworkId.POLYGON_TESTNET]: 'polygon',
    [NetworkId.ARBITRUM_TESTNET]: 'eth',
    [1]: 'eth',
    [5]: 'eth',
    [69696]: 'eth'
}

export function useNativeCurrencyBadge(chainId?: number) {
    const defaultChainId = useChainId()
    return NETWORK_BADGES[chainId ?? defaultChainId] ?? 'eth'
}