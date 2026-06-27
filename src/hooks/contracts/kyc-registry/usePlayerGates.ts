import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import useKycRegistryRead from '../read/useKycRegistryRead'

// Reads the player's accumulated gate bitmap from KYCRegistry. The bitmap
// is the union of every gate the player has been granted (Sumsub IDV, address
// verification, SoF declarations, etc.); per-tier `requiredGates` masks check
// against this bitmap. Invalidated by BlockpotEventsProvider on PlayerGatesSet.
export default function usePlayerGates(address: Address) {
    const chainId = useChainId()
    const registry = useKycRegistryRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['kyc:playerGates', chainId, address],
        queryFn: async () => registry.getPlayerGates([address]),
        enabled: address !== ZERO_ADDRESS,
    })

    return {
        gates: BigInt(data ?? 0n),
        isLoading,
    }
}
