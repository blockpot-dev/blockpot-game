import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import useKycRegistryRead from '../read/useKycRegistryRead'

// Single-call compliance gate — returns true iff (MLRO override active)
// OR (the tier the player walks up to is gate-passing AND profit-fitting
// against the active KYCPolicy ladder). The chain-side function consults
// the registered IKYCProfitProvider (LGO) for the player's net EUR-minor
// profit. Invalidated by BlockpotEventsProvider on PlayerGatesSet,
// TierOverrideSet, TierOverrideCleared, and PolicyAdded.
export default function useIsCompliant(address: Address) {
    const chainId = useChainId()
    const registry = useKycRegistryRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['kyc:isCompliant', chainId, address],
        queryFn: async () => registry.isCompliant([address]),
        enabled: address !== ZERO_ADDRESS,
    })

    return {
        isCompliant: data ?? false,
        isLoading,
    }
}
