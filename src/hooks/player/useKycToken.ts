import { useMutation } from '@tanstack/react-query'
import { authedFetch } from '@/api/gamingServiceClient'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { ZERO_ADDRESS } from '@/web3/constants'
import { KycTier } from './usePlayerKyc'

export type KycToken = {
    token: string
    sdkLevel: string
    ttlSeconds: number
    sdkBaseUrl: string
}

type KycTokenResponse = {
    token: string
    sdkLevel: string
    ttlSeconds: number
    sdkBaseUrl: string
}

async function postKycToken(targetTier: KycTier): Promise<KycToken> {
    const body = await authedFetch<KycTokenResponse>('/v1/kyc/token', {
        method: 'POST',
        body: { targetTier },
    })
    return {
        token: body.token,
        sdkLevel: body.sdkLevel,
        ttlSeconds: body.ttlSeconds,
        sdkBaseUrl: body.sdkBaseUrl,
    }
}

// Sumsub access tokens are short-lived. Fetch on mount via a mutation so
// repeat step visits always re-issue rather than surfacing a cached stale token.
export default function useKycToken() {
    const address = useAccountAddress()

    return useMutation({
        mutationFn: async (targetTier: KycTier) => {
            if (address === ZERO_ADDRESS) {
                throw new Error('wallet not connected')
            }
            return postKycToken(targetTier)
        },
    })
}
