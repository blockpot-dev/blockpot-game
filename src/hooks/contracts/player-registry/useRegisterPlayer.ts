import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Address } from 'viem'
import { useChainId } from 'wagmi'
import { ApiError, authedFetch } from '@/api/gamingServiceClient'

type RegisterResponse = {
    operationId: string
    status: string
}

function opStorageKey(chainId: number, address: Address) {
    return `lgo:registrationOp:${chainId}:${address.toLowerCase()}`
}

export function readPendingOperationId(chainId: number, address: Address | undefined): string | null {
    if (!address) return null
    try {
        return localStorage.getItem(opStorageKey(chainId, address))
    } catch {
        return null
    }
}

function writeOperationId(chainId: number, address: Address, operationId: string) {
    try {
        localStorage.setItem(opStorageKey(chainId, address), operationId)
    } catch {
        // storage failures are non-fatal — polling still works via the query cache
    }
}

export function clearOperationId(chainId: number, address: Address) {
    try {
        localStorage.removeItem(opStorageKey(chainId, address))
    } catch {
        /* noop */
    }
}

export const WALLET_ALREADY_REGISTERED_CODE = 'WALLET_ALREADY_REGISTERED'

function submitRegistration(attestationId: string): Promise<RegisterResponse> {
    return authedFetch<RegisterResponse>('/v1/players/register', {
        method: 'POST',
        body: { attestationId },
    })
}

export type RegisterArgs = {
    address: Address
    attestationId: string
}

// Submits the registration request with the previously recorded attestation_id.
// Auth uses the Bearer JWT minted by /v1/auth/verify (see useSiweSignature);
// the server derives address + chainId from the JWT claims.
export default function useRegisterPlayer() {
    const chainId = useChainId()
    const queryClient = useQueryClient()

    const mutation = useMutation<RegisterResponse, ApiError | Error, RegisterArgs>({
        mutationFn: async ({ address, attestationId }) => {
            const op = await submitRegistration(attestationId)
            writeOperationId(chainId, address, op.operationId)
            queryClient.setQueryData(['playerRegistrationOp', chainId, address], op.operationId)
            // Task 55: a successful register may have triggered a Sumsub-pull
            // cascade server-side that lights gate bits before the user sees
            // any chain event. Pre-invalidate the per-player KYC reads
            // consumed by usePlayerActivityState so the GateChanged-driven
            // refetch from BlockpotEventsProvider isn't stale-locked behind
            // the 1h default cache.
            queryClient.invalidateQueries({ queryKey: ['kyc:tierOf', chainId, address] })
            queryClient.invalidateQueries({ queryKey: ['kyc:playerGates', chainId, address] })
            queryClient.invalidateQueries({ queryKey: ['kyc:activePolicy', chainId] })
            return op
        },
    })

    return mutation
}
