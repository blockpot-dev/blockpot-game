import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { Address } from 'viem'
import { ApiError } from '@/api/gamingServiceClient'

const authedFetchMock = vi.fn()
vi.mock('@/api/gamingServiceClient', async () => {
    const actual = await vi.importActual<typeof import('@/api/gamingServiceClient')>(
        '@/api/gamingServiceClient',
    )
    return {
        ...actual,
        authedFetch: (...args: unknown[]) => authedFetchMock(...args),
    }
})

const activityMock = vi.fn()
vi.mock('@/hooks/player-summary/usePlayerActivityState', () => ({
    default: () => activityMock(),
}))

const ethUsdMock = vi.fn()
vi.mock('@/hooks/contracts/chainlink/useNativeCurrencyToUSDPrice', () => ({
    useNativeCurrencyToUSDPrice: () => ethUsdMock(),
}))

const eurUsdMock = vi.fn()
vi.mock('@/hooks/contracts/chainlink/useEurToUSDPrice', () => ({
    useEurToUSDPrice: () => eurUsdMock(),
}))

import useClaimRequest from './useClaimRequest'

const PLAYER = '0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657' as Address

// 1 ETH = 2000 USD; 1 EUR = 1.10 USD. Both feeds 1e8 decimals (mainnet shape).
// Pricing 1 ETH (1e18 wei): eur8 = 1e18 * 2000e8 / (1.10e8 * 1e10)
// = 2000e26 / 1.10e18 ≈ 1.81818e11 → eurMinor = 1.81818e11 / 1e6 = 181818
// → €1,818.18.
function setPriceFeeds() {
    ethUsdMock.mockReturnValue({ bigNumber: 2_000_00000000n, decimals: 8 })
    eurUsdMock.mockReturnValue({ bigNumber: 1_10000000n, decimals: 8 })
}

function setActivityState(over: { cumClaimsEurMinor: number, capEurMinor: number | null, cumWonEurMinor?: number }) {
    const headroom = over.capEurMinor != null
        ? Math.max(0, over.capEurMinor - over.cumClaimsEurMinor)
        : Number.MAX_SAFE_INTEGER
    activityMock.mockReturnValue({
        state: {
            currentTier: 'T1',
            cumWageredEurMinor: 0,
            cumWonEurMinor: over.cumWonEurMinor ?? 0,
            cumClaimsEurMinor: over.cumClaimsEurMinor,
            largestSingleWinEurMinor: 0,
            inflow: {
                capEurMinor: 2_000_00,
                usedEurMinor: 0,
                headroomEurMinor: 2_000_00,
                ratio: 0,
            },
            outflow: {
                capEurMinor: over.capEurMinor,
                usedEurMinor: over.cumClaimsEurMinor,
                headroomEurMinor: headroom,
                ratio: over.capEurMinor ? Math.min(over.cumClaimsEurMinor / over.capEurMinor, 1) : 0,
            },
            nextTier: over.capEurMinor != null
                ? { tier: 'T2', missingGates: 1n << 2n, inflowCapEurMinor: 10_000_00, outflowCapEurMinor: 10_000_00 }
                : null,
            pendingClaimEurMinor: 0,
        },
        isLoading: false,
    })
}

function makeWrapper() {
    const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const Wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: qc }, children)
    Wrapper.displayName = 'TestQueryClientWrapper'
    return Wrapper
}

const baseInput = {
    fromWallet: PLAYER,
    toWallet: PLAYER,
    amountWei: 10n ** 18n, // 1 ETH → ~€1,818 under the mocked feeds
    chainId: 1,
    inWeth: false,
}

describe('useClaimRequest — forward-looking HEADROOM_EXCEEDED guard', () => {
    beforeEach(() => {
        authedFetchMock.mockReset()
        activityMock.mockReset()
        ethUsdMock.mockReset()
        eurUsdMock.mockReset()
        setPriceFeeds()
    })

    it('rejects with HEADROOM_EXCEEDED before pretx when the claim exceeds outflow headroom', async () => {
        // €100 claimed; outflow cap at €1,000 → €900 headroom. 1 ETH prices
        // to ~€1,818 → far over. Nothing won → no partial-claim suggestion.
        setActivityState({ cumClaimsEurMinor: 100_00, capEurMinor: 1_000_00 })

        const { result } = renderHook(() => useClaimRequest(), { wrapper: makeWrapper() })

        await expect(result.current.mutateAsync(baseInput)).rejects.toMatchObject({
            name: 'ApiError',
            code: 'HEADROOM_EXCEEDED',
            message: 'Activity headroom exceeded.',
        })
        expect(authedFetchMock).not.toHaveBeenCalled()
    })

    it('carries the partial-claim suggestion min(escrowed, outflowHeadroom) in the rejection', async () => {
        // €600 won, €100 claimed → €500 escrowed; €900 of headroom remains.
        // The suggestion is the smaller of the two: €500.
        setActivityState({ cumClaimsEurMinor: 100_00, capEurMinor: 1_000_00, cumWonEurMinor: 600_00 })

        const { result } = renderHook(() => useClaimRequest(), { wrapper: makeWrapper() })

        await expect(result.current.mutateAsync(baseInput)).rejects.toMatchObject({
            code: 'HEADROOM_EXCEEDED',
            message: expect.stringContaining('€500.00'),
        })
        expect(authedFetchMock).not.toHaveBeenCalled()
    })

    it('proceeds to pretx when the claim fits inside outflow headroom', async () => {
        // €100 claimed; cap at €5,000 → €4,900 headroom. 1 ETH prices to
        // ~€1,818 < €4,900 → guard passes, pretx is called.
        setActivityState({ cumClaimsEurMinor: 100_00, capEurMinor: 5_000_00 })
        authedFetchMock.mockResolvedValue({
            decision: { allow: true, reason: '', required_action: 'NONE' },
            operation_id: 'op-123',
        })

        const { result } = renderHook(() => useClaimRequest(), { wrapper: makeWrapper() })
        const decision = await result.current.mutateAsync(baseInput)

        expect(authedFetchMock).toHaveBeenCalledOnce()
        expect(decision).toEqual({
            allow: true,
            reason: '',
            requiredAction: 'NONE',
            operationId: 'op-123',
        })
    })

    it('skips the guard on an unlimited outflow side (top tier) and forwards to pretx', async () => {
        setActivityState({ cumClaimsEurMinor: 50_000_00, capEurMinor: null })
        authedFetchMock.mockResolvedValue({
            decision: { allow: true, reason: '', required_action: 'NONE' },
            operation_id: 'op-x',
        })

        const { result } = renderHook(() => useClaimRequest(), { wrapper: makeWrapper() })
        await result.current.mutateAsync(baseInput)

        expect(authedFetchMock).toHaveBeenCalledOnce()
    })

    it('skips the guard when either Chainlink feed is unwired (bigNumber 0)', async () => {
        // Even with cum + claim that WOULD trip the guard, a missing feed
        // makes priceWeiEurMinor return null and the request falls through.
        setActivityState({ cumClaimsEurMinor: 100_00, capEurMinor: 1_000_00 })
        eurUsdMock.mockReturnValue({ bigNumber: 0n, decimals: 8 })
        authedFetchMock.mockResolvedValue({
            decision: { allow: true, reason: '', required_action: 'NONE' },
        })

        const { result } = renderHook(() => useClaimRequest(), { wrapper: makeWrapper() })
        await result.current.mutateAsync(baseInput)

        expect(authedFetchMock).toHaveBeenCalledOnce()
    })

    it('surfaces an ApiError that the caller can pattern-match on .code', async () => {
        setActivityState({ cumClaimsEurMinor: 0, capEurMinor: 100_00 }) // €100 cap, 1 ETH would blow past it.
        const { result } = renderHook(() => useClaimRequest(), { wrapper: makeWrapper() })

        let caught: unknown
        try {
            await result.current.mutateAsync(baseInput)
        } catch (e) {
            caught = e
        }
        await waitFor(() => expect(caught).toBeDefined())
        expect(caught).toBeInstanceOf(ApiError)
        expect((caught as ApiError).code).toBe('HEADROOM_EXCEEDED')
    })
})
