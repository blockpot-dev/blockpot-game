import { encodeAbiParameters, keccak256 } from 'viem'
import { DrawProofInputs } from '@/types/draw/drawProof'

const MAX_UINT256 = 2n ** 256n - 1n

// Mirrors DrawRandomNumberProvider._MAX_REJECTION_RETRIES.
const MAX_REJECTION_RETRIES = 100

/**
 * Client-side reproduction of DrawRandomNumberProvider._drawNumbers.
 *
 * Mirrors the on-chain rejection-sampling loop byte-exactly: each candidate is
 * uint256(keccak256(abi.encode(seed, i, retryCounter))), candidates above the
 * modulo-bias threshold are rejected, and a used-number collision costs TWO
 * retry-counter increments (the Solidity loop increments once inside the
 * collision branch and once unconditionally at the end of the iteration).
 */
export function reproduceDrawnNumbers(inputs: DrawProofInputs): number[] {
    const { seed, maxNumber, totalNumbers } = inputs
    const n = BigInt(maxNumber) + 1n
    const threshold = MAX_UINT256 - (MAX_UINT256 % n)

    const numbers: number[] = []
    const used = new Set<number>()

    for (let i = 0; i < totalNumbers; i++) {
        let retryCounter = 0
        let accepted = false

        while (retryCounter < MAX_REJECTION_RETRIES) {
            const candidate = BigInt(
                keccak256(
                    encodeAbiParameters(
                        [{ type: 'uint256' }, { type: 'uint8' }, { type: 'uint8' }],
                        [seed, i, retryCounter]
                    )
                )
            )

            if (candidate <= threshold) {
                const proposedNumber = Number(candidate % n)
                if (!used.has(proposedNumber)) {
                    used.add(proposedNumber)
                    numbers.push(proposedNumber)
                    accepted = true
                    break
                } else {
                    ++retryCounter
                }
            }

            ++retryCounter
        }

        if (!accepted) {
            throw new Error(
                `Rejection sampling failed for draw index ${i} after ${MAX_REJECTION_RETRIES} retries`
            )
        }
    }

    return numbers
}
