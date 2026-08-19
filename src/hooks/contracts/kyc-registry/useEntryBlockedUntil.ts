import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import useKycRegistryRead from '../read/useKycRegistryRead'

// Reads the on-chain `entryBlockedUntil` primitive (task 94): epoch seconds
// until which `the operator.enter`/`enterWeth` revert `EntryBlocked` for the player;
// 0 = not blocked. Written by the gaming service's chainwrite queue (future
// rolling-window / RG rules); deliberately NOT bypassed by the MLRO tier
// override.
//
// Invalidated by BlockpotEventsProvider on EntryBlockSet.
export default function useEntryBlockedUntil(address: Address) {
    const chainId = useChainId()
    const registry = useKycRegistryRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['kyc:entryBlockedUntil', chainId, address],
        queryFn: async () => BigInt(await registry.entryBlockedUntil([address])),
        enabled: address !== ZERO_ADDRESS,
    })

    const blockedUntil = data ?? 0n
    return {
        blockedUntil,
        isBlocked: blockedUntil > BigInt(Math.floor(Date.now() / 1000)),
        isLoading,
    }
}
