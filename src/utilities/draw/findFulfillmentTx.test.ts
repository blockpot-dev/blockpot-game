import { describe, expect, it, vi } from 'vitest'
import { findFulfillmentTx, FulfillmentLogClient } from './findFulfillmentTx'

const provider = '0x2000000000000000000000000000000000000002' as const
const draw = '0x1000000000000000000000000000000000000001' as const
const SEED = 0xabcn

function client(logs: { transactionHash: `0x${string}`; blockNumber: bigint | null; args: { seed?: bigint } }[]) {
    const getLogs = vi.fn().mockResolvedValue(logs)
    return { client: { getLogs } as unknown as FulfillmentLogClient, getLogs }
}

describe('findFulfillmentTx', () => {
    it('filters by game and round from genesis and returns the matching hash', async () => {
        const { client: c, getLogs } = client([{ transactionHash: '0xaaaa', blockNumber: 10n, args: { seed: SEED } }])
        await expect(findFulfillmentTx(c, { randomNumberProviderAddress: provider, drawAddress: draw, roundIndex: 7, seed: SEED })).resolves.toBe('0xaaaa')
        expect(getLogs).toHaveBeenCalledWith(expect.objectContaining({
            address: provider,
            args: { game: draw, roundIndex: 7 },
            fromBlock: 0n,
            toBlock: 'latest',
        }))
    })

    it('honours a per-chain fromBlock', async () => {
        const { client: c, getLogs } = client([])
        await findFulfillmentTx(c, { randomNumberProviderAddress: provider, drawAddress: draw, roundIndex: 7, seed: SEED, fromBlock: 123n })
        expect(getLogs).toHaveBeenCalledWith(expect.objectContaining({ fromBlock: 123n }))
    })

    it('returns the latest log whose seed equals the displayed seed', async () => {
        const { client: c } = client([
            { transactionHash: '0x1111', blockNumber: 5n, args: { seed: SEED } },
            { transactionHash: '0x2222', blockNumber: 9n, args: { seed: 0xdeadn } }, // re-request with another seed
            { transactionHash: '0x3333', blockNumber: 7n, args: { seed: SEED } },
        ])
        await expect(findFulfillmentTx(c, { randomNumberProviderAddress: provider, drawAddress: draw, roundIndex: 7, seed: SEED })).resolves.toBe('0x3333')
    })

    it('returns null when no log matches the seed', async () => {
        const { client: c } = client([{ transactionHash: '0x2222', blockNumber: 9n, args: { seed: 0xdeadn } }])
        await expect(findFulfillmentTx(c, { randomNumberProviderAddress: provider, drawAddress: draw, roundIndex: 7, seed: SEED })).resolves.toBeNull()
    })

    it('returns null instead of throwing when the RPC rejects the query', async () => {
        const c = { getLogs: vi.fn().mockRejectedValue(new Error('block range too large')) } as unknown as FulfillmentLogClient
        await expect(findFulfillmentTx(c, { randomNumberProviderAddress: provider, drawAddress: draw, roundIndex: 7, seed: SEED })).resolves.toBeNull()
    })
})
