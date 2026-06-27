import { Address, isAddressEqual } from 'viem'
import { LotteryEntry } from '@/types/lottery'
import { ZERO_ADDRESS } from '@/web3/constants'
import useLotteryRead from '@/hooks/contracts/read/useLotteryRead'
import useLGORead from '@/hooks/contracts/read/useLGORead'

// v2 entries route through the LGO contract, so the on-chain beneficiary recorded
// by Lottery.entries is the LGO contract — entriesForBeneficiary(round, player) is
// always empty. The real player is in lgo.entryOwnerOf. Mirror resolveLgoWinners:
// list every LGO-attributed entry, resolve each entry's owner, and keep the ones
// owned by the connected wallet.
export async function resolvePlayerEntries(
    roundIndex: number,
    connectedWallet: Address | undefined,
    lotteryAddress: Address,
    lgoAddress: Address,
    game: ReturnType<typeof useLotteryRead>['game'],
    lgo: ReturnType<typeof useLGORead>['read'],
): Promise<LotteryEntry[]> {
    if (!connectedWallet || isAddressEqual(connectedWallet, ZERO_ADDRESS)) return []

    const entryIndices = await game.entriesForBeneficiary([roundIndex, lgoAddress])
    if (entryIndices.length === 0) return []

    const [entries, owners] = await Promise.all([
        Promise.all(entryIndices.map((i) => game.getEntry([i, roundIndex]))),
        Promise.all(entryIndices.map((i) => lgo.entryOwnerOf([lotteryAddress, roundIndex, i]))),
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
