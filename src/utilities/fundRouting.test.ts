import { describe, expect, it } from 'vitest'
import { computeFundRouting } from './fundRouting'
import { PEA_PER_ENTRY_WEI } from '@/constants/protocol'
import { DEFAULT_GAME_CONFIG, GameConfig } from '@/types/lottery/config'

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

describe('computeFundRouting — main game', () => {
    it('splits PEA across 3 tiers + a next-pot reserve, with no parent-game row', () => {
        const pea = PEA_PER_ENTRY_WEI // 0.001 ETH = 1e15 wei
        const routing = computeFundRouting(pea, mainGameConfig)

        // currentPot = 90% of PEA = 9e14; tiers split that 9000/900/100.
        expect(routing.tiers).toHaveLength(3)
        expect(routing.tiers[0]).toEqual({ label: 'Jackpot', bps: 8100, amount: 810_000_000_000_000n, percent: 81 })
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
