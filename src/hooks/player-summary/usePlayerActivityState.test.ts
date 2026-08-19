import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import usePlayerActivityState from './usePlayerActivityState'

const PLAYER = '0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657'
const UINT256_MAX = (1n << 256n) - 1n

const tierMock = vi.fn()
const gatesMock = vi.fn()
const snapshotMock = vi.fn()
const policyMock = vi.fn()

vi.mock('@/hooks/utilities/useAccountAddress', () => ({
    default: () => PLAYER,
}))

vi.mock('@/hooks/contracts/kyc-registry/useKycTier', () => ({
    default: () => tierMock(),
}))

vi.mock('@/hooks/contracts/kyc-registry/usePlayerGates', () => ({
    default: () => gatesMock(),
}))

vi.mock('@/hooks/contracts/lgo/useLifetimeSnapshot', () => ({
    default: () => snapshotMock(),
}))

vi.mock('@/hooks/contracts/kyc/useActivePolicy', () => ({
    default: () => policyMock(),
}))

type Tier = {
    requiredGates: bigint
    inflowCapEurMinor: bigint
    outflowCapEurMinor: bigint
}

function tier(requiredGates: bigint, inflowCap: bigint, outflowCap: bigint): Tier {
    return { requiredGates, inflowCapEurMinor: inflowCap, outflowCapEurMinor: outflowCap }
}

const BIT_PHOTO_ID = 1n << 1n
const BIT_ADDRESS = 1n << 2n
const BIT_SOF = 1n << 3n
const BIT_TAX_RES = 1n << 14n

// Phase 1 matrix (EUR-minor): T0 €900 in / €500 out with zero gates; the
// asymmetry on T0 is the paper's outflow-weighted posture. Top tier carries
// type(uint256).max on both fields = unlimited.
const PHASE1_LADDER: Tier[] = [
    tier(0n, 900_00n, 500_00n),
    tier(BIT_PHOTO_ID, 2_000_00n, 2_000_00n),
    tier(BIT_PHOTO_ID | BIT_ADDRESS, 10_000_00n, 10_000_00n),
    tier(BIT_PHOTO_ID | BIT_ADDRESS | BIT_SOF, 50_000_00n, 30_000_00n),
    tier(BIT_PHOTO_ID | BIT_ADDRESS | BIT_SOF | BIT_TAX_RES, UINT256_MAX, UINT256_MAX),
]

const ALL_GATES = BIT_PHOTO_ID | BIT_ADDRESS | BIT_SOF | BIT_TAX_RES

function withDefaults(over: { tierOrdinal?: number, gates?: bigint, snapshot?: Partial<{
    enteredEurMinor: bigint, wonEurMinor: bigint, largestSingleWinEurMinor: bigint, claimedEurMinor: bigint,
}>, tiers?: Tier[] } = {}) {
    tierMock.mockReturnValue({ tier: over.tierOrdinal ?? 0, isLoading: false })
    gatesMock.mockReturnValue({ gates: over.gates ?? 0n, isLoading: false })
    snapshotMock.mockReturnValue({
        snapshot: {
            enteredEurMinor: 0n,
            wonEurMinor: 0n,
            largestSingleWinEurMinor: 0n,
            claimedEurMinor: 0n,
            ...(over.snapshot ?? {}),
        },
        isLoading: false,
    })
    policyMock.mockReturnValue({
        policy: { tiers: over.tiers ?? PHASE1_LADDER, description: 'test' },
        isLoading: false,
    })
}

describe('usePlayerActivityState — directional flow derivation', () => {
    beforeEach(() => {
        tierMock.mockReset()
        gatesMock.mockReset()
        snapshotMock.mockReset()
        policyMock.mockReset()
    })

    it('surfaces the lifetime counters from the snapshot', () => {
        withDefaults({
            snapshot: {
                enteredEurMinor: 300_00n,
                wonEurMinor: 120_00n,
                largestSingleWinEurMinor: 80_00n,
                claimedEurMinor: 50_00n,
            },
        })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.cumEnteredEurMinor).toBe(300_00)
        expect(result.current.state?.cumWonEurMinor).toBe(120_00)
        expect(result.current.state?.largestSingleWinEurMinor).toBe(80_00)
        expect(result.current.state?.cumClaimsEurMinor).toBe(50_00)
    })

    it('derives the asymmetric T0 inflow and outflow flows independently', () => {
        // T0 caps: €900 in / €500 out. With €300 entered and €100 claimed the
        // two sides scale against their own caps, not a shared one.
        withDefaults({ snapshot: { enteredEurMinor: 300_00n, claimedEurMinor: 100_00n } })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.inflow).toEqual({
            capEurMinor: 900_00,
            usedEurMinor: 300_00,
            headroomEurMinor: 600_00,
            ratio: 300_00 / 900_00,
        })
        expect(result.current.state?.outflow).toEqual({
            capEurMinor: 500_00,
            usedEurMinor: 100_00,
            headroomEurMinor: 400_00,
            ratio: 100_00 / 500_00,
        })
    })

    it('saturates headroom at zero and clamps ratio at 1 when used exceeds the cap', () => {
        withDefaults({ snapshot: { claimedEurMinor: 700_00n } })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.outflow.headroomEurMinor).toBe(0)
        expect(result.current.state?.outflow.ratio).toBe(1)
    })

    it('treats the uint256.max sentinel as unlimited on both sides at the top tier', () => {
        withDefaults({
            tierOrdinal: 4,
            gates: ALL_GATES,
            snapshot: { enteredEurMinor: 120_000_00n, claimedEurMinor: 80_000_00n },
        })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.inflow.capEurMinor).toBeNull()
        expect(result.current.state?.inflow.headroomEurMinor).toBe(Number.MAX_SAFE_INTEGER)
        expect(result.current.state?.inflow.ratio).toBe(0)
        expect(result.current.state?.outflow.capEurMinor).toBeNull()
        expect(result.current.state?.outflow.usedEurMinor).toBe(80_000_00)
    })

    it('caps follow the chain tier, not activity: a T3 player reads T3 caps', () => {
        withDefaults({
            tierOrdinal: 3,
            gates: BIT_PHOTO_ID | BIT_ADDRESS | BIT_SOF,
            snapshot: { enteredEurMinor: 1_500_00n, claimedEurMinor: 600_00n },
        })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.currentTier).toBe('T3')
        expect(result.current.state?.inflow.capEurMinor).toBe(50_000_00)
        expect(result.current.state?.outflow.capEurMinor).toBe(30_000_00)
    })

    it('exposes the next tier with the missing-gates bitmask and its caps', () => {
        // T0 player holding only the photo-ID gate: T1 needs nothing more
        // gate-wise once photo ID is held — but this player is at T0 per the
        // chain walk, so nextTier is T1 with missingGates = T1.required & ~held.
        withDefaults({ tierOrdinal: 0, gates: 0n })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.nextTier).toEqual({
            tier: 'T1',
            missingGates: BIT_PHOTO_ID,
            inflowCapEurMinor: 2_000_00,
            outflowCapEurMinor: 2_000_00,
        })
    })

    it('masks already-held gates out of nextTier.missingGates', () => {
        withDefaults({ tierOrdinal: 1, gates: BIT_PHOTO_ID })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.nextTier?.tier).toBe('T2')
        expect(result.current.state?.nextTier?.missingGates).toBe(BIT_ADDRESS)
    })

    it('reports unlimited next-tier caps as null', () => {
        withDefaults({ tierOrdinal: 3, gates: BIT_PHOTO_ID | BIT_ADDRESS | BIT_SOF })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.nextTier).toEqual({
            tier: 'T4',
            missingGates: BIT_TAX_RES,
            inflowCapEurMinor: null,
            outflowCapEurMinor: null,
        })
    })

    it('returns nextTier = null at the top tier', () => {
        withDefaults({ tierOrdinal: 4, gates: ALL_GATES })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.nextTier).toBeNull()
    })

    it('derives pendingClaimEurMinor as escrow beyond outflow headroom', () => {
        // Won €600, claimed €0 at T0 (outflow cap €500): €600 sits in escrow,
        // €500 of headroom remains, so €100 is held until verification.
        withDefaults({ snapshot: { wonEurMinor: 600_00n, claimedEurMinor: 0n } })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.pendingClaimEurMinor).toBe(100_00)
    })

    it('reports zero pendingClaim when escrow fits inside outflow headroom', () => {
        withDefaults({ snapshot: { wonEurMinor: 300_00n, claimedEurMinor: 0n } })

        const { result } = renderHook(() => usePlayerActivityState())
        expect(result.current.state?.pendingClaimEurMinor).toBe(0)
    })

    it('exposes exactly the two-track contract — no leftover three-track fields', () => {
        withDefaults()

        const { result } = renderHook(() => usePlayerActivityState())
        expect(Object.keys(result.current.state ?? {}).sort()).toEqual([
            'cumClaimsEurMinor',
            'cumEnteredEurMinor',
            'cumWonEurMinor',
            'currentTier',
            'inflow',
            'largestSingleWinEurMinor',
            'nextTier',
            'outflow',
            'pendingClaimEurMinor',
        ])
    })
})
