import { describe, expect, it } from 'vitest'
import { computeFundRouting } from './fundRouting'
import { PEA_PER_ENTRY_WEI } from '@/constants/protocol'
import { DEFAULT_GAME_CONFIG, GameConfig } from '@/types/draw/config'

// Main game: 3 tiers (9000/900/100 bps of the current pot), 10% of PEA to the
// next-pot reserve, nothing to a parent game.
const mainGameConfig: GameConfig = {
    ...DEFAULT_GAME_CONFIG,
    prizeTierAllocations: [9000, 900, 100],
    nextPotAllocation: 1000,
    parentGamePotAllocation: 0,
}

function sumAmounts(...amounts: bigint[]): bigint {
    return amounts.reduce((acc, a) => acc + a, 0n)
}

// Quick game: 5 tiers (8000/1000/600/300/100 bps of the current pot), no
// next-pot reserve, 20% of PEA forwarded to the parent (main) game.
const quickGameConfig: GameConfig = {
    ...DEFAULT_GAME_CONFIG,
    prizeTierAllocations: [8000, 1000, 600, 300, 100],
    nextPotAllocation: 0,
    parentGamePotAllocation: 2000,
}

describe('computeFundRouting — main game', () => {
    it('splits PEA across 3 tiers + a next-pot reserve, with no parent-game row', () => {
        const pea = PEA_PER_ENTRY_WEI // 0.001 ETH = 1e15 wei
        const routing = computeFundRouting(pea, mainGameConfig)

        // currentPot = 90% of PEA = 9e14; tiers split that 9000/900/100.
        expect(routing.tiers).toHaveLength(3)
        expect(routing.tiers[0]).toEqual({ label: 'Top prize', bps: 8100, amount: 810_000_000_000_000n, percent: 81 })
        expect(routing.tiers[1]).toEqual({ label: '2nd', bps: 810, amount: 81_000_000_000_000n, percent: 8.1 })
        expect(routing.tiers[2]).toEqual({ label: '3rd', bps: 90, amount: 9_000_000_000_000n, percent: 0.9 })

        expect(routing.nextPot).toEqual({ label: 'Next-pot reserve', bps: 1000, amount: 100_000_000_000_000n, percent: 10 })
        expect(routing.parentGame).toBeUndefined()
    })

    it('routes every wei of PEA (amounts sum back to PEA)', () => {
        const pea = PEA_PER_ENTRY_WEI
        const routing = computeFundRouting(pea, mainGameConfig)
        const total = sumAmounts(
            ...routing.tiers.map(t => t.amount),
            routing.nextPot?.amount ?? 0n,
            routing.parentGame?.amount ?? 0n,
        )
        expect(total).toBe(pea)
    })
})

describe('computeFundRouting — quick game', () => {
    it('splits PEA across 5 tiers + a parent-game row, with no next-pot reserve', () => {
        const pea = PEA_PER_ENTRY_WEI
        const routing = computeFundRouting(pea, quickGameConfig)

        // currentPot = 80% of PEA = 8e14; tiers split that 8000/1000/600/300/100.
        expect(routing.tiers).toHaveLength(5)
        expect(routing.tiers.map(t => t.label)).toEqual(['Top prize', '2nd', '3rd', '4th', '5th'])
        expect(routing.tiers[0]).toEqual({ label: 'Top prize', bps: 6400, amount: 640_000_000_000_000n, percent: 64 })
        expect(routing.tiers[4]).toEqual({ label: '5th', bps: 80, amount: 8_000_000_000_000n, percent: 0.8 })

        expect(routing.parentGame).toEqual({ label: 'Parent game', bps: 2000, amount: 200_000_000_000_000n, percent: 20 })
        expect(routing.nextPot).toBeUndefined()
    })

    it('scales linearly for a multi-entry PEA and still sums back to PEA', () => {
        const pea = PEA_PER_ENTRY_WEI * 7n
        const routing = computeFundRouting(pea, quickGameConfig)

        expect(routing.parentGame?.amount).toBe(200_000_000_000_000n * 7n)
        const total = sumAmounts(
            ...routing.tiers.map(t => t.amount),
            routing.nextPot?.amount ?? 0n,
            routing.parentGame?.amount ?? 0n,
        )
        expect(total).toBe(pea)
    })
})
