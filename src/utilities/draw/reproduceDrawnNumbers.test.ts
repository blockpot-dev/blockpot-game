import { describe, expect, it, vi } from 'vitest'
import vectors from './__fixtures__/draw-vectors.json'
import { reproduceDrawnNumbers, uniformBelow } from './reproduceDrawnNumbers'

// Ground-truth vectors emitted by the Solidity implementation itself:
// `unipot-contracts/script/GenerateDrawVectors.s.sol` runs the production
// `DrawRandomNumberProvider._drawNumbers` (partial Fisher-Yates + `_uniformBelow`)
// through `test/harness/DrawNumbersHarness.sol` with the real keccak NumberGenerator.
// Regenerate with `CONTRACT_COMMIT=$(git rev-parse HEAD) forge script script/GenerateDrawVectors.s.sol`
// and copy `out/draw-vectors.json` here verbatim. The `contractCommit` field records
// the unipot-contracts commit the vectors were generated at.
describe('reproduceDrawnNumbers', () => {
    it('carries provenance', () => {
        expect(vectors.generator).toBe('unipot-contracts/script/GenerateDrawVectors.s.sol')
        expect(vectors.contractCommit).toMatch(/^[0-9a-f]{40}$/)
    })

    for (const v of vectors.vectors) {
        it(`reproduces the on-chain draw for ${v.name}`, () => {
            const numbers = reproduceDrawnNumbers({
                requestId: 1n,
                seed: BigInt(v.seed),
                maxNumber: v.maxNumber,
                totalNumbers: v.totalNumbers
            })
            expect(numbers).toEqual(v.expected)
        })
    }

    it('returns distinct numbers within [0, maxNumber]', () => {
        const numbers = reproduceDrawnNumbers({ requestId: 1n, seed: 0xabcdefn, maxNumber: 9, totalNumbers: 8 })
        expect(new Set(numbers).size).toBe(8)
        for (const n of numbers) {
            expect(n).toBeGreaterThanOrEqual(0)
            expect(n).toBeLessThanOrEqual(9)
        }
    })
})

describe('uniformBelow', () => {
    it('short-circuits to 0 when range is 1', () => {
        expect(uniformBelow(123n, 0, 1n)).toBe(0)
    })

    it('rejects a word in the bottom residue and accepts the next attempt', async () => {
        // The rejection branch is unreachable with real keccak output (P ≈ 2^-208), so stub the
        // hash: attempt 0 yields a word below rejectBelow, attempt 1 yields an accepted word.
        vi.resetModules()
        const range = 7n
        const rejectBelow = ((2n ** 256n - 1n) % range + 1n) % range // == 2^256 % range == 2
        expect(rejectBelow).toBe(2n)
        const words = [rejectBelow - 1n, rejectBelow + 4n] // 1 → rejected; 6 → accepted, 6 % 7 == 6
        let call = 0
        vi.doMock('viem', async () => {
            const actual = await vi.importActual<typeof import('viem')>('viem')
            return {
                ...actual,
                keccak256: () => `0x${words[call++]!.toString(16).padStart(64, '0')}` as `0x${string}`,
            }
        })
        const { uniformBelow: stubbed } = await import('./reproduceDrawnNumbers')
        expect(stubbed(1n, 0, range)).toBe(6)
        expect(call).toBe(2)
        vi.doUnmock('viem')
    })
})
