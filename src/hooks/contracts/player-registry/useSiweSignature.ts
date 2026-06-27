import { useMutation } from '@tanstack/react-query'
import { Address } from 'viem'
import { useChainId, useSignMessage } from 'wagmi'
import { publicFetch } from '@/api/gamingServiceClient'
import { usePlayerSession } from '@/providers/PlayerSessionProvider'

type NonceResponse = {
    nonce: string
    expiresAt: string
    message: string
}

type VerifyResponse = {
    token: string
    expiresAt: string
    address: string
    chainId: number
}

export type SiweSignature = {
    address: Address
    message: string
    signature: string
    token: string
    expiresAt: Date
    chainId: number
}

// Runs the one-time wallet prompt + SIWE → JWT exchange. The returned Bearer
// token is stashed in PlayerSessionProvider (and mirrored into the module
// token store) so every subsequent session-gated fetch (/v1/attestation,
// /v1/players/register, /v1/kyc/*, /v1/pretx/*, …) can attach it via
// `authedFetch`. Backend nonce consumption is atomic, so the single wallet
// signature covers all downstream calls within the JWT TTL (default ~5 mins).
export default function useSiweSignature() {
    const chainId = useChainId()
    const { signMessageAsync } = useSignMessage()
    const { setSession } = usePlayerSession()

    return useMutation({
        mutationFn: async ({ address }: { address: Address }): Promise<SiweSignature> => {
            const nonce = await publicFetch<NonceResponse>('/v1/auth/nonce', {
                method: 'POST',
                body: { chainId, address },
            })
            const signature = await signMessageAsync({ account: address, message: nonce.message })
            const verify = await publicFetch<VerifyResponse>('/v1/auth/verify', {
                method: 'POST',
                body: { chainId, address, message: nonce.message, signature },
            })
            const expiresAt = new Date(verify.expiresAt)
            setSession({
                token: verify.token,
                address,
                chainId,
                expiresAt,
            })
            return {
                address,
                message: nonce.message,
                signature,
                token: verify.token,
                expiresAt,
                chainId,
            }
        },
    })
}
