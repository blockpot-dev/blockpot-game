import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { Address } from 'viem'

const publicFetchMock = vi.fn()
vi.mock('@/api/gamingServiceClient', async () => {
    const actual = await vi.importActual<typeof import('@/api/gamingServiceClient')>(
        '@/api/gamingServiceClient',
    )
    return {
        ...actual,
        publicFetch: (...args: unknown[]) => publicFetchMock(...args),
    }
})

const signMessageAsyncMock = vi.fn()
vi.mock('wagmi', async () => {
    const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
    return {
        ...actual,
        useChainId: () => 69696,
        useSignMessage: () => ({ signMessageAsync: signMessageAsyncMock }),
    }
})

const setSessionMock = vi.fn()
vi.mock('@/providers/PlayerSessionProvider', () => ({
    usePlayerSession: () => ({ setSession: setSessionMock }),
}))

import useSiweSignature from './useSiweSignature'

const PLAYER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address
const SIWE_MESSAGE = 'beta.blockpot.com wants you to sign in with your Ethereum account: …'
const SIGNATURE = '0xsigned'
const TOKEN = 'jwt-token'
const EXPIRES_AT = '2026-08-13T08:00:00Z'

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    return createElement(QueryClientProvider, { client }, children)
}

describe('useSiweSignature', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        publicFetchMock.mockImplementation(async (path: string) => {
            if (path === '/v1/auth/nonce') {
                return { nonce: 'abc123', expiresAt: EXPIRES_AT, message: SIWE_MESSAGE }
            }
            if (path === '/v1/auth/verify') {
                return { token: TOKEN, expiresAt: EXPIRES_AT, address: PLAYER, chainId: 69696 }
            }
            throw new Error(`unexpected path ${path}`)
        })
        signMessageAsyncMock.mockResolvedValue(SIGNATURE)
    })

    it('runs nonce → sign → verify and stashes the Bearer session', async () => {
        const { result } = renderHook(() => useSiweSignature(), { wrapper })

        const siwe = await result.current.mutateAsync({ address: PLAYER })

        expect(publicFetchMock).toHaveBeenNthCalledWith(1, '/v1/auth/nonce', {
            method: 'POST',
            body: { chainId: 69696, address: PLAYER },
        })
        expect(signMessageAsyncMock).toHaveBeenCalledWith({ account: PLAYER, message: SIWE_MESSAGE })
        expect(publicFetchMock).toHaveBeenNthCalledWith(2, '/v1/auth/verify', {
            method: 'POST',
            body: { chainId: 69696, address: PLAYER, message: SIWE_MESSAGE, signature: SIGNATURE },
        })
        expect(setSessionMock).toHaveBeenCalledWith({
            token: TOKEN,
            address: PLAYER,
            chainId: 69696,
            expiresAt: new Date(EXPIRES_AT),
        })
        expect(siwe.token).toBe(TOKEN)
        expect(siwe.signature).toBe(SIGNATURE)
    })

    it('does not verify or store a session when the wallet refuses to sign', async () => {
        signMessageAsyncMock.mockRejectedValue(new Error('User rejected'))
        const { result } = renderHook(() => useSiweSignature(), { wrapper })

        await expect(result.current.mutateAsync({ address: PLAYER })).rejects.toThrow('User rejected')
        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(publicFetchMock).toHaveBeenCalledTimes(1)
        expect(publicFetchMock).toHaveBeenCalledWith('/v1/auth/nonce', expect.anything())
        expect(setSessionMock).not.toHaveBeenCalled()
    })
})
