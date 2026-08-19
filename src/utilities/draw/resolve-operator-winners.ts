import { isAddressEqual } from 'viem'
import { DrawnNumber } from '@/types/draw'
import { ZERO_ADDRESS } from '@/web3/constants'
import useDrawRead from '@/hooks/contracts/read/useDrawRead'
import useOperatorRead from '@/hooks/contracts/read/useOperatorRead'

// v2 entries route through the operator contract, so the on-chain `winner` is the
// the operator contract address. The real player is recorded in `lgo.entryOwnerOf`.
// Map each operator-attributed draw back to its player by finding the operator entry
// whose ticket range contains the drawn number.
export async function resolveOperatorWinners(
    draws: readonly DrawnNumber[],
    roundIndex: number,
    drawAddress: `0x${string}`,
    operatorAddress: `0x${string}`,
    game: ReturnType<typeof useDrawRead>['game'],
    lgo: ReturnType<typeof useOperatorRead>['read'],
): Promise<readonly DrawnNumber[]> {
    const hasOperatorWins = draws.some((d) => isAddressEqual(d.winner, operatorAddress))
    if (!hasOperatorWins) return draws

    const entryIndices = await game.entriesForBeneficiary([roundIndex, operatorAddress])
    if (entryIndices.length === 0) return draws

    const [entries, owners] = await Promise.all([
        Promise.all(entryIndices.map((i) => game.getEntry([i, roundIndex]))),
        Promise.all(entryIndices.map((i) => lgo.entryOwnerOf([drawAddress, roundIndex, i]))),
    ])

    const ranges = entryIndices.map((entryIndex, idx) => ({
        entryIndex,
        start: entries[idx].entryStart,
        end: entries[idx].entryStart + entries[idx].amount - 1,
        player: owners[idx][0],
    }))

    return draws.map((draw) => {
        if (!isAddressEqual(draw.winner, operatorAddress)) return draw
        const range = ranges.find((r) => draw.number >= r.start && draw.number <= r.end)
        if (!range || isAddressEqual(range.player, ZERO_ADDRESS)) return draw
        return { ...draw, winner: range.player }
    })
}
