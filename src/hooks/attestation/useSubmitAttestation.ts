import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Address } from 'viem'
import { useChainId } from 'wagmi'
import { ApiError, authedFetch } from '@/api/gamingServiceClient'

export type AttestationPayload = {
    address: Address
    tosVersionHash: string
    dobSelfDeclared: string
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
        // The v2 body is DOB + TOS hash and nothing else (BLO-674). There is no
        // declared country: the server resolves it from the request and decides
        // eligibility there. Do not add one back — the server ignores unknown
        // keys, so a reintroduced field would be silently dead while still
        // manufacturing the evidence the gate change exists to avoid.
        body: {
            tos_version_hash: payload.tosVersionHash,
            dob_self_declared: payload.dobSelfDeclared,
        },
    })
    return { attestationId: body.attestation_id }
}

// Records the player's age + TOS attestation on the gaming service, and is the
// call that runs the registration eligibility gate: the server resolves country
// from the request, refuses blocked jurisdictions, checks age against that
// jurisdiction's threshold, and screens the wallet for sanctions. Each refusal
// comes back as HTTP 403 with an `ApiError.code` the modal renders. Auth uses the Bearer JWT minted by /v1/auth/verify (see
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
