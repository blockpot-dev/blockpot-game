import { isAddressEqual } from 'viem'
import { DrawnNumber } from '@/types/draw'
import { ZERO_ADDRESS } from '@/web3/constants'
import useDrawRead from '@/hooks/contracts/read/useDrawRead'
import useLGORead from '@/hooks/contracts/read/useLGORead'

// v2 entries route through the LGO contract, so the on-chain `winner` is the
// LGO contract address. The real player is recorded in `lgo.entryOwnerOf`.
// Map each LGO-attributed draw back to its player by finding the LGO entry
// whose ticket range contains the drawn number.
export async function resolveLgoWinners(
    draws: readonly DrawnNumber[],
    roundIndex: number,
    drawAddress: `0x${string}`,
    lgoAddress: `0x${string}`,
    game: ReturnType<typeof useDrawRead>['game'],
    lgo: ReturnType<typeof useLGORead>['read'],
): Promise<readonly DrawnNumber[]> {
    const hasLgoWins = draws.some((d) => isAddressEqual(d.winner, lgoAddress))
    if (!hasLgoWins) return draws

    const entryIndices = await game.entriesForBeneficiary([roundIndex, lgoAddress])
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
        if (!isAddressEqual(draw.winner, lgoAddress)) return draw
        const range = ranges.find((r) => draw.number >= r.start && draw.number <= r.end)
        if (!range || isAddressEqual(range.player, ZERO_ADDRESS)) return draw
        return { ...draw, winner: range.player }
    })
}
