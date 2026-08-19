import { Address, isAddressEqual } from 'viem'
import { DrawEntry } from '@/types/draw'
import { ZERO_ADDRESS } from '@/web3/constants'
import useDrawRead from '@/hooks/contracts/read/useDrawRead'
import useLGORead from '@/hooks/contracts/read/useLGORead'

// v2 entries route through the LGO contract, so the on-chain beneficiary recorded
// by the Draw core’s `entries` is the LGO contract — entriesForBeneficiary(round, player) is
// always empty. The real player is in lgo.entryOwnerOf. Mirror resolveLgoWinners:
// list every LGO-attributed entry, resolve each entry's owner, and keep the ones
// owned by the connected wallet.
export async function resolvePlayerEntries(
    roundIndex: number,
    connectedWallet: Address | undefined,
    drawAddress: Address,
    lgoAddress: Address,
    game: ReturnType<typeof useDrawRead>['game'],
    lgo: ReturnType<typeof useLGORead>['read'],
): Promise<DrawEntry[]> {
    if (!connectedWallet || isAddressEqual(connectedWallet, ZERO_ADDRESS)) return []

    const entryIndices = await game.entriesForBeneficiary([roundIndex, lgoAddress])
    if (entryIndices.length === 0) return []

    const [entries, owners] = await Promise.all([
        Promise.all(entryIndices.map((i) => game.getEntry([i, roundIndex]))),
        Promise.all(entryIndices.map((i) => lgo.entryOwnerOf([drawAddress, roundIndex, i]))),
    ])

    return entryIndices.flatMap((entryIndex, idx) => {
        const player = owners[idx][0]
        if (!isAddressEqual(player, connectedWallet)) return []
        const entry = entries[idx]
        return [{
            index: entryIndex,
            beneficiary: entry.beneficiary,
            entryStart: entry.entryStart,
            amount: entry.amount,
            payoutInWeth: entry.payoutInWeth,
        }]
    })
}
