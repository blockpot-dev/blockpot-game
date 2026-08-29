import { Address, Hash, getAbiItem } from 'viem'
import { randomNumberProviderAbi } from '@/abi/randomNumberProviderAbi'

export const RANDOM_NUMBERS_FULFILLED_EVENT = getAbiItem({
    abi: randomNumberProviderAbi,
    name: 'RandomNumbersFulfilled',
})

/** The subset of a viem PublicClient this lookup needs — keeps tests dependency-free. */
export type FulfillmentLogClient = {
    getLogs: (args: {
        address: Address
        event: typeof RANDOM_NUMBERS_FULFILLED_EVENT
        args: { game: Address; roundIndex: number }
        fromBlock: bigint
        toBlock: 'latest'
    }) => Promise<readonly { transactionHash: Hash; blockNumber: bigint | null; args: { seed?: bigint } }[]>
}

export type FindFulfillmentTxInput = {
    randomNumberProviderAddress: Address
    drawAddress: Address
    roundIndex: number
    /** The seed the page displays. A log for a different seed is never returned. */
    seed: bigint
    /** Earliest block to scan; defaults to genesis. Set per chain for range-capped public RPCs. */
    fromBlock?: bigint
}

/**
 * Finds the transaction in which Chainlink VRF fulfilled the seed for (game, round).
 *
 * `game` and `roundIndex` are indexed on `RandomNumbersFulfilled`, so the filter is exact. A round
 * that was re-requested (seed re-drawn after a rejection-sampling revert) emits more than one log;
 * the latest one whose `seed` equals the displayed seed wins. Any RPC failure (range caps on public
 * nodes, unsupported filters) resolves to `null` — the proof itself never depends on this lookup.
 */
export async function findFulfillmentTx(client: FulfillmentLogClient, input: FindFulfillmentTxInput): Promise<Hash | null> {
    try {
        const logs = await client.getLogs({
            address: input.randomNumberProviderAddress,
            event: RANDOM_NUMBERS_FULFILLED_EVENT,
            args: { game: input.drawAddress, roundIndex: input.roundIndex },
            fromBlock: input.fromBlock ?? 0n,
            toBlock: 'latest',
        })
        const matching = logs.filter((log) => log.args.seed === input.seed)
        if (matching.length === 0) return null
        const latest = matching.reduce((best, log) =>
            (log.blockNumber ?? 0n) >= (best.blockNumber ?? 0n) ? log : best
        )
        return latest.transactionHash
    } catch {
        return null
    }
}
