import { BASIS_POINTS_DIVISOR } from '@/constants/protocol'
import { GameConfig } from '@/types/draw/config'

export type FundRoutingEntry = {
    label: string // e.g. "Top prize", "2nd", "Next prize pool", "Parent game"
    bps: number // share of PEA in basis points (amount / pea)
    amount: bigint // wei routed to this bucket for the given PEA
    percent: number // amount / pea * 100
}

export type FundRouting = {
    tiers: FundRoutingEntry[]
    nextPot?: FundRoutingEntry // omitted when nextPotAllocation === 0
    parentGame?: FundRoutingEntry // omitted when parentGamePotAllocation === 0
}

function ordinalLabel(ordinal: number): string {
    switch (ordinal) {
    case 1: return 'Top prize'
    case 2: return '2nd'
    case 3: return '3rd'
    default: return `${ordinal}th`
    }
}

// Express every bucket as a share of the whole PEA so the dialog can show a
// single consistent percentage frame (Top prize 81%, next-pot 10%, …) regardless
// of whether the underlying config is relative to PEA (next-pot / parent) or to
// the current pot (tiers).
function makeEntry(label: string, amount: bigint, pea: bigint): FundRoutingEntry {
    const bps = pea === 0n ? 0 : Number((amount * BASIS_POINTS_DIVISOR) / pea)
    return { label, bps, amount, percent: bps / 100 }
}

// Projects where a single entry's PEA is routed, mirroring the on-chain split in
// UnipotFundsManager._updatedAllocations + currentPots():
//   nextPot / parentGame are bps of PEA; the remainder is the current pot, which
//   is itself split across the winner tiers. The current-pot remainder absorbs
//   integer-division rounding exactly as the contract does, so amounts sum to PEA.
export function computeFundRouting(pea: bigint, gameConfig: GameConfig): FundRouting {
    const { nextPotAllocation, parentGamePotAllocation, prizeTierAllocations } = gameConfig

    const nextPotAmount = (pea * BigInt(nextPotAllocation)) / BASIS_POINTS_DIVISOR
    const parentGameAmount = (pea * BigInt(parentGamePotAllocation)) / BASIS_POINTS_DIVISOR
    const currentPotAmount = pea - nextPotAmount - parentGameAmount

    const tiers = prizeTierAllocations.map((alloc, index) => {
        const amount = (currentPotAmount * BigInt(alloc)) / BASIS_POINTS_DIVISOR
        return makeEntry(ordinalLabel(index + 1), amount, pea)
    })

    const routing: FundRouting = { tiers }
    if (nextPotAllocation > 0) {
        routing.nextPot = makeEntry('Next prize pool', nextPotAmount, pea)
    }
    if (parentGamePotAllocation > 0) {
        routing.parentGame = makeEntry('Parent game', parentGameAmount, pea)
    }
    return routing
}
