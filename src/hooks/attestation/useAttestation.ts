import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { useChainId } from 'wagmi'
import { readStoredAttestationId } from './useSubmitAttestation'

// Exposes the current wallet's recorded attestation_id for downstream surfaces
// (e.g. a future settings page that displays the attestation history). The
// value is hydrated from localStorage so it survives reloads without a server
// round-trip — the server remains the source of truth for the attestation
// itself.
export default function useAttestation(address: Address | undefined) {
    const chainId = useChainId()

    return useQuery<string | null>({
        queryKey: ['attestation', chainId, address],
        queryFn: () => readStoredAttestationId(chainId, address),
        enabled: !!address,
        staleTime: Infinity,
        gcTime: Infinity,
    })
}
