import { encodeAbiParameters, keccak256 } from 'viem'
import { DrawProofInputs } from '@/types/draw/drawProof'

const MAX_UINT256 = 2n ** 256n - 1n

// Mirrors DrawRandomNumberProvider._MAX_REJECTION_RETRIES.
const MAX_REJECTION_RETRIES = 100

export class RejectionSamplingFailed extends Error {
    constructor(index: number) {
        super(`Rejection sampling failed for draw index ${index} after ${MAX_REJECTION_RETRIES} attempts`)
        this.name = 'RejectionSamplingFailed'
    }
}

/**
 * Port of `DrawRandomNumberProvider._uniformBelow` (unipot-contracts 0.2.0): a uniform integer in
 * `[0, range)` with exact zero modulo bias via bottom-residue rejection. Each attempt hashes
 * `abi.encode(uint256 seed, uint8 i, uint256 attempt)` through the keccak NumberGenerator; words
 * below `2^256 % range` are rejected so the accepted words number a whole multiple of `range`.
 */
export function uniformBelow(seed: bigint, i: number, range: bigint): number {
    if (range === 1n) return 0 // single choice; skip the draw

    const rejectBelow = ((MAX_UINT256 % range) + 1n) % range // == 2^256 % range

    for (let attempt = 0; attempt < MAX_REJECTION_RETRIES; attempt++) {
        const word = BigInt(
            keccak256(
                encodeAbiParameters(
                    [{ type: 'uint256' }, { type: 'uint8' }, { type: 'uint256' }],
                    [seed, i, BigInt(attempt)]
                )
            )
        )
        if (word >= rejectBelow) {
            return Number(word % range)
        }
    }
    throw new RejectionSamplingFailed(i)
}

/**
 * Client-side reproduction of `DrawRandomNumberProvider._drawNumbers` (unipot-contracts 0.2.0).
 *
 * Partial Fisher-Yates over a virtual array `a[x] == x` for `x in [0, maxNumber]`: for each step `i`,
 * draw `j = i + uniformBelow(seed, i, n - i)`, emit `a[j]`, then set `a[j] = a[i]`. Only touched
 * positions are materialised (the on-chain sparse `(swapPos, swapVal)` arrays), so distinctness
 * holds by construction and the only failure mode is rejection-sampling exhaustion.
 */
export function reproduceDrawnNumbers(inputs: DrawProofInputs): number[] {
    const { seed, maxNumber, totalNumbers } = inputs
    const n = BigInt(maxNumber) + 1n

    const overrides = new Map<number, number>()
    const readVirtual = (index: number): number => overrides.get(index) ?? index

    const numbers: number[] = []
    for (let i = 0; i < totalNumbers; i++) {
        const j = i + uniformBelow(seed, i, n - BigInt(i))
        const aj = readVirtual(j)
        const ai = readVirtual(i)
        numbers.push(aj)
        overrides.set(j, ai)
    }

    return numbers
}
