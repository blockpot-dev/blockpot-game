import { describe, expect, it } from 'vitest'
import { reproduceDrawnNumbers } from './reproduceDrawnNumbers'

// Ground-truth fixtures computed by the Solidity implementation itself:
// a Foundry harness exposing DrawRandomNumberProvider._drawNumbers
// (unipot-contracts) was run over these inputs and its outputs captured here.
// The util must reproduce them byte-exactly, including the rejection-sampling
// loop's retry-counter behaviour (double increment on a used-number collision).
const fixtures = [
    {
        name: 'fixtureA: 5 numbers in [0, 99]',
        seed: 0x1111111111111111111111111111111111111111111111111111111111112222n,
        maxNumber: 99,
        totalNumbers: 5,
        expectedNumbers: [62, 37, 75, 74, 92]
    },
    {
        name: 'fixtureB: 8 numbers in [0, 9] (collision-heavy)',
        seed: 0xabcdefn,
        maxNumber: 9,
        totalNumbers: 8,
        expectedNumbers: [4, 0, 9, 3, 1, 5, 6, 7]
    },
    {
        name: 'fixtureC: 3 numbers in [0, 48]',
        seed: 0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefn,
        maxNumber: 48,
        totalNumbers: 3,
        expectedNumbers: [43, 17, 26]
    }
]

describe('reproduceDrawnNumbers', () => {
    for (const fixture of fixtures) {
        it(`reproduces the on-chain draw for ${fixture.name}`, () => {
            const numbers = reproduceDrawnNumbers({
                requestId: 1n,
                seed: fixture.seed,
                maxNumber: fixture.maxNumber,
                totalNumbers: fixture.totalNumbers
            })
            expect(numbers).toEqual(fixture.expectedNumbers)
        })
    }

    it('returns unique numbers within [0, maxNumber]', () => {
        const numbers = reproduceDrawnNumbers({
            requestId: 1n,
            seed: 0xabcdefn,
            maxNumber: 9,
            totalNumbers: 8
        })
        expect(new Set(numbers).size).toBe(8)
        for (const n of numbers) {
            expect(n).toBeGreaterThanOrEqual(0)
            expect(n).toBeLessThanOrEqual(9)
        }
    })
})
