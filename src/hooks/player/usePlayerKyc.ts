import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { Address } from 'viem'
import { authedFetch, isServiceConfigured } from '@/api/gamingServiceClient'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { ZERO_ADDRESS } from '@/web3/constants'
import { usePlayerSession } from '@/providers/PlayerSessionProvider'

export type KycTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4'

export type GateStatus = 'passed' | 'pending' | 'failed' | 'expired'

// Mirrors the gaming-service `compliance.GateType` enum (compliance/types.go).
// `selfie_liveness` is intentionally absent — Sumsub's GREEN review collapses
// ID + liveness into a single backend `photo_id=passed` write, and no
// service path produces a separate liveness gate row.
export type GateType =
    | 'wallet_owned'
    | 'photo_id'
    | 'proof_of_address'
    | 'sanctions_screened_clear'
    | 'sof_declared'
    | 'sof_documented'
    | 'sow_light'
    | 'sow_forensic'
    | 'pep_screened_clear'
    | 'adverse_media_clear'
    | 'enhanced_address_proof'
    | 'video_kyc'
    | 'employer_verification'
    | 'bank_account_verified'
    | 'tax_residency_documented'

export type GateRecord = {
    status: GateStatus
    expiresAt?: string
    rejectionReason?: string
}

export type PlayerKycStatus = {
    currentTier: KycTier
    gates: Partial<Record<GateType, GateRecord>>
    pendingTierUpgrade?: KycTier
    pendingCddEurMinor: number
}

// Wire shape for GET /v1/kyc/status. The handler is mixed-case
// (httpapi/kyc_handler.go): `currentTier` / `pendingTierUpgrade` are
// camelCase, `pending_cdd_eur_minor` stays snake. The gate sub-shape
// only carries `status` + `expires_at` — `rejection_reason` is NOT on
// the wire today (renderGates omits the notes column), so the
// AgeRejectionBanner won't surface a Sumsub UNDERAGE reason until the
// backend includes it.
type KycStatusResponse = {
    currentTier: KycTier
    gates: Record<string, {
        status: GateStatus
        expires_at?: string
    }>
    pendingTierUpgrade?: KycTier
    pendingCddEurMinor: number
}

function mapStatus(body: KycStatusResponse): PlayerKycStatus {
    const gates: Partial<Record<GateType, GateRecord>> = {}
    for (const [k, v] of Object.entries(body.gates ?? {})) {
        gates[k as GateType] = {
            status: v.status,
            expiresAt: v.expires_at,
        }
    }
    return {
        currentTier: body.currentTier,
        gates,
        pendingTierUpgrade: body.pendingTierUpgrade,
        pendingCddEurMinor: body.pendingCddEurMinor ?? 0,
    }
}

async function fetchKycStatus(): Promise<KycStatusResponse> {
    return authedFetch<KycStatusResponse>('/v1/kyc/status')
}

export const kycStatusQueryKey = (address: Address | null) => ['playerKyc', address] as const

export default function usePlayerKyc() {
    const address = useAccountAddress()
    const queryClient = useQueryClient()
    const { activeToken } = usePlayerSession()
    const enabled = address !== ZERO_ADDRESS && isServiceConfigured() && !!activeToken()

    // No polling: BlockpotEventsProvider's PlayerGatesSet watcher invalidates
    // ['playerKyc'] when the chain emits a gate change, so a fresh wallet's
    // /v1/kyc/status response refreshes within the chain's block time without
    // a fixed-interval refetch.
    const query = useQuery({
        queryKey: kycStatusQueryKey(enabled ? (address as Address) : null),
        queryFn: fetchKycStatus,
        enabled,
        refetchOnWindowFocus: true,
    })

    const status: PlayerKycStatus | undefined = query.data
        ? mapStatus(query.data)
        : undefined

    useEffect(() => {
        if (!enabled) return
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                void query.refetch()
            }
        }
        document.addEventListener('visibilitychange', onVisible)
        return () => document.removeEventListener('visibilitychange', onVisible)
    }, [enabled, query])

    // Explicit refresh hook for callers that close the Sumsub SDK and need a
    // synchronous re-read — the SDK does not round-trip through the backend
    // immediately, and the chain-side PlayerGatesSet event only fires once the
    // service has flushed the chain-write job, so a manual invalidation gives
    // the post-modal UI a deterministic refresh point.
    const refresh = useCallback(() => {
        if (!enabled) return
        void queryClient.invalidateQueries({ queryKey: kycStatusQueryKey(address as Address) })
    }, [enabled, queryClient, address])

    return {
        status,
        isLoading: query.isLoading,
        error: query.error,
        refresh,
    }
}
