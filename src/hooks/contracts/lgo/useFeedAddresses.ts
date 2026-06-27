import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import useLGORead from '../read/useLGORead'

// Reads the feed addresses straight off the LGO so the transparency surface
// shows what the contract actually consults — not what this frontend has
// configured. The two should match, but reading on-chain is the honest
// thing to display.
export default function useFeedAddresses() {
    const chainId = useChainId()
    const lgo = useLGORead().read

    const { data, isLoading } = useQuery({
        queryKey: ['lgo:feedAddresses', chainId],
        queryFn: async () => {
            const [eth, eur] = await Promise.all([
                lgo.ethUsdFeed(),
                lgo.eurUsdFeed(),
            ])
            return { eth: eth as Address, eur: eur as Address }
        },
    })

    return {
        ethUsdFeed: data?.eth ?? ZERO_ADDRESS,
        eurUsdFeed: data?.eur ?? ZERO_ADDRESS,
        isLoading,
    }
}
