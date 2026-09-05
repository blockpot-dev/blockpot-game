import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { Address } from 'viem'
import { useChainId } from 'wagmi'
import { isServiceConfigured } from '@/api/gamingServiceClient'
import { ZERO_ADDRESS } from '@/web3/constants'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useSubmitAttestation, { AttestationPayload, readStoredAttestationId } from '@/hooks/attestation/useSubmitAttestation'
import useIsPlayerActive from './useIsPlayerActive'
import useRegisterPlayer, {
    readPendingOperationId,
    WALLET_ALREADY_REGISTERED_CODE,
} from './useRegisterPlayer'
import useRegistrationOperation from './useRegistrationOperation'
import useSiweSignature, { SiweSignature } from './useSiweSignature'

export type RegistrationPhase =
    | 'idle'
    | 'signing'
    | 'awaiting_attestation'
    | 'submitting_attestation'
    | 'submitting_registration'

type AttestationInput = Pick<AttestationPayload, 'dobSelfDeclared' | 'tosVersionHash'>

// The registration gate's refusals (BLO-674). Each is a terminal HTTP 403 from
// POST /v1/attestation: the visitor cannot retry into a different answer, so
// the modal replaces its form with the matching copy rather than surfacing
// these as a form error.
const REFUSAL_CODES = ['JURISDICTION_BLOCKED', 'UNDERAGE', 'SANCTIONS_REFUSAL'] as const
type RefusalCode = (typeof REFUSAL_CODES)[number]

function refusalCodeOf(err: unknown): RefusalCode | undefined {
    const code = (err as { code?: string } | null)?.code
    return REFUSAL_CODES.includes(code as RefusalCode) ? (code as RefusalCode) : undefined
}

export default function usePlayerRegistration() {
    const chainId = useChainId()
    const queryClient = useQueryClient()
    const address = useAccountAddress()
    const hasAddress = address !== ZERO_ADDRESS
    const { isActive, isLoading: isActiveLoading } = useIsPlayerActive(address)

    // Shared cache entry for the pending op id. useRegisterPlayer writes to the same
    // key via queryClient.setQueryData on success, so header + entry panel stay in sync
    // without prop-drilling local state.
    const { data: operationId = null } = useQuery<string | null>({
        queryKey: ['playerRegistrationOp', chainId, address],
        queryFn: () => readPendingOperationId(chainId, address as Address),
        staleTime: Infinity,
        gcTime: Infinity,
        enabled: hasAddress,
    })

    const { data: storedAttestationId = null } = useQuery<string | null>({
        queryKey: ['attestation', chainId, address],
        queryFn: () => readStoredAttestationId(chainId, address as Address),
        staleTime: Infinity,
        gcTime: Infinity,
        enabled: hasAddress,
    })

    const siweMutation = useSiweSignature()
    const attestationMutation = useSubmitAttestation()
    const registerMutation = useRegisterPlayer()
    const { data: op } = useRegistrationOperation(
        operationId,
        hasAddress ? (address as Address) : undefined,
    )

    const [phase, setPhase] = useState<RegistrationPhase>('idle')
    const [attestationModalOpen, setAttestationModalOpen] = useState(false)
    const [pendingSiwe, setPendingSiwe] = useState<SiweSignature | null>(null)
    const [flowError, setFlowError] = useState<Error | null>(null)
    // `attestationOnly=true` when the flow is invoked for an already-registered
    // player whose attestation record is missing (e.g. a player migrated from a
    // pre-attestation signup). In that case we run SIWE + attestation but skip
    // the /v1/players/register call.
    const [attestationOnly, setAttestationOnly] = useState(false)

    const status = op?.status
    const isPending = status === 'PENDING' || status === 'SIGNING' || status === 'SUBMITTED'
    const isFailed = status === 'REVERTED' || status === 'FAILED'

    const resetFlow = useCallback(() => {
        setPhase('idle')
        setPendingSiwe(null)
        setFlowError(null)
        siweMutation.reset()
        attestationMutation.reset()
        registerMutation.reset()
    }, [siweMutation, attestationMutation, registerMutation])

    const startFlow = useCallback(async (opts: { attestationOnly: boolean }) => {
        if (!hasAddress) return
        setFlowError(null)
        // If the wallet is already ACTIVE on-chain, the register tx would
        // revert (and the backend would 409 with WALLET_ALREADY_REGISTERED).
        // Collapse to attestation-only regardless of the caller's intent —
        // the attestation row is all that's left to reconcile.
        const effectiveAttestationOnly = opts.attestationOnly || isActive
        setAttestationOnly(effectiveAttestationOnly)
        try {
            setPhase('signing')
            const sig = await siweMutation.mutateAsync({ address: address as Address })
            setPendingSiwe(sig)
            setPhase('awaiting_attestation')
            setAttestationModalOpen(true)
        } catch (err) {
            setPhase('idle')
            setFlowError(err as Error)
            setPendingSiwe(null)
            setAttestationOnly(false)
        }
    }, [address, hasAddress, isActive, siweMutation])

    const register = useCallback(() => startFlow({ attestationOnly: false }), [startFlow])

    const startAttestationOnly = useCallback(() => startFlow({ attestationOnly: true }), [startFlow])

    const confirmAttestation = useCallback(async (input: AttestationInput) => {
        if (!pendingSiwe) return
        setFlowError(null)
        try {
            setPhase('submitting_attestation')
            const { attestationId } = await attestationMutation.mutateAsync({
                address: pendingSiwe.address,
                dobSelfDeclared: input.dobSelfDeclared,
                tosVersionHash: input.tosVersionHash,
            })
            if (!attestationOnly) {
                setPhase('submitting_registration')
                try {
                    await registerMutation.mutateAsync({
                        address: pendingSiwe.address,
                        attestationId,
                    })
                } catch (err) {
                    // Race fallback: if the wallet was registered between the
                    // upfront isActive check and the register call (e.g. stale
                    // cache, or frontend/backend pointed at different
                    // PlayerRegistry instances), the backend 409s with
                    // WALLET_ALREADY_REGISTERED. Treat it as benign — the
                    // attestation row is already written, which is all the
                    // reconciliation this wallet needs.
                    const typed = err as Error & { code?: string }
                    if (typed.code !== WALLET_ALREADY_REGISTERED_CODE) throw err
                    // Clear the mutation's own error state so `registerError`
                    // doesn't leak the 409 to consumers.
                    registerMutation.reset()
                    void queryClient.invalidateQueries({ queryKey: ['isPlayerActive', chainId, pendingSiwe.address] })
                }
            }
            setAttestationModalOpen(false)
            setPendingSiwe(null)
            setAttestationOnly(false)
            setPhase('idle')
        } catch (err) {
            setPhase('awaiting_attestation')
            setFlowError(err as Error)
        }
    }, [attestationMutation, attestationOnly, chainId, pendingSiwe, queryClient, registerMutation])

    const cancelAttestation = useCallback(() => {
        setAttestationModalOpen(false)
        setPendingSiwe(null)
        setAttestationOnly(false)
        setPhase('idle')
    }, [])

    const isSigning = phase === 'signing'
    const isAwaitingAttestation = phase === 'awaiting_attestation'
    const isSubmittingAttestation = phase === 'submitting_attestation'
    const isSubmittingRegistration = phase === 'submitting_registration'
    const isSubmittingAny = isSubmittingAttestation || isSubmittingRegistration

    const registerError = flowError
        ?? siweMutation.error
        ?? attestationMutation.error
        ?? registerMutation.error

    // A gate refusal is not a form error and must not be rendered as one: there
    // is no input the visitor can change to pass. Split it out so the modal can
    // replace itself with the refusal copy.
    const attestationRefusal = refusalCodeOf(registerError)

    const needsAttestation = hasAddress && isActive && !storedAttestationId

    return {
        address,
        hasAddress,
        isActive,
        isActiveLoading,

        // phase flags exposed to callers. `isSigning` remains semantically "busy
        // with the first step" and covers the SIWE prompt; the registration
        // submit is surfaced as `isPending` via the on-chain operation poll
        // below.
        phase,
        isSigning,
        isAwaitingAttestation,
        isSubmittingAttestation,
        isSubmittingRegistration,
        isSubmittingAny,
        isPending,
        isFailed,

        // attestation modal wiring — the caller renders <AttestationModal/>
        // using these.
        attestationModalOpen,
        setAttestationModalOpen,
        attestationOnly,
        attestationRefusal,
        confirmAttestation,
        cancelAttestation,

        // pre-deposit fallback — true when the player is registered on-chain
        // but the client has no recorded attestation_id for them. Callers gate
        // the entry form and call startAttestationOnly() to run SIWE +
        // /v1/attestation without re-registering.
        needsAttestation,
        startAttestationOnly,

        storedAttestationId,

        op,
        register,
        registerError,
        resetFlow,
        serviceConfigured: isServiceConfigured(),
    }
}
