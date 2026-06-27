import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Address } from 'viem'
import { useChainId } from 'wagmi'
import { ApiError, authedFetch } from '@/api/gamingServiceClient'

export type AttestationPayload = {
    address: Address
    tosVersionHash: string
    dobSelfDeclared: string
    jurisdictionSelfDeclared: string
}

export type AttestationResult = {
    attestationId: string
}

type AttestationResponse = {
    attestation_id: string
}

function storageKey(chainId: number, address: Address) {
    return `lgo:attestation:${chainId}:${address.toLowerCase()}`
}

export function readStoredAttestationId(chainId: number, address: Address | undefined): string | null {
    if (!address) return null
    try {
        return localStorage.getItem(storageKey(chainId, address))
    } catch {
        return null
    }
}

function writeStoredAttestationId(chainId: number, address: Address, attestationId: string) {
    try {
        localStorage.setItem(storageKey(chainId, address), attestationId)
    } catch {
        // non-fatal — flow still proceeds using the hook result
    }
}

async function postAttestation(payload: AttestationPayload): Promise<AttestationResult> {
    const body = await authedFetch<AttestationResponse>('/v1/attestation', {
        method: 'POST',
        body: {
            tos_version_hash: payload.tosVersionHash,
            dob_self_declared: payload.dobSelfDeclared,
            jurisdiction_self_declared: payload.jurisdictionSelfDeclared,
        },
    })
    return { attestationId: body.attestation_id }
}

// Records the player's age + jurisdiction + TOS attestation on the gaming
// service. Auth uses the Bearer JWT minted by /v1/auth/verify (see
// useSiweSignature) — wallet address, chainId, and SIWE material are derived
// server-side from the JWT claims. The returned attestation_id flows into
// /v1/players/register.
export default function useSubmitAttestation() {
    const chainId = useChainId()
    const queryClient = useQueryClient()

    return useMutation<AttestationResult, ApiError | Error, AttestationPayload>({
        mutationFn: async (payload: AttestationPayload) => {
            const result = await postAttestation(payload)
            writeStoredAttestationId(chainId, payload.address, result.attestationId)
            queryClient.setQueryData(['attestation', chainId, payload.address], result.attestationId)
            return result
        },
    })
}
