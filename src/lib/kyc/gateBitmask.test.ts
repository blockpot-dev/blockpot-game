import { describe, expect, it } from 'vitest'
import { GATE_BIT_POSITION, GATE_DISPLAY, gatesFromBitmask, unknownGateBits } from './gateBitmask'

// The phase-1 testnet policy's T3 mask: wallet_owned (0), photo_id (1),
// proof_of_address (2), sanctions_screened_clear (8), tax_residency_documented (14).
const T3_REQUIRED_GATES = 16647n

describe('gateBitmask', () => {
    it('maps tax_residency_documented to bit 14 (task 91 gate)', () => {
        expect(GATE_BIT_POSITION.tax_residency_documented).toBe(14)
        expect(GATE_DISPLAY.tax_residency_documented.label).toBeTruthy()
        expect(GATE_DISPLAY.tax_residency_documented.description).toBeTruthy()
    })

    it('decodes the on-chain T3 mask including the bit-14 gate', () => {
        expect(gatesFromBitmask(T3_REQUIRED_GATES)).toEqual([
            'wallet_owned',
            'photo_id',
            'proof_of_address',
            'sanctions_screened_clear',
            'tax_residency_documented',
        ])
    })

    describe('unknownGateBits', () => {
        it('returns no bits for a fully-known mask', () => {
            expect(unknownGateBits(T3_REQUIRED_GATES)).toEqual([])
        })

        it('returns no bits for the empty bitmap', () => {
            expect(unknownGateBits(0n)).toEqual([])
        })

        it('surfaces bits the gate table does not know about', () => {
            expect(unknownGateBits((1n << 20n) | 0b111n)).toEqual([20])
        })

        it('returns multiple unknown bits ascending', () => {
            expect(unknownGateBits((1n << 200n) | (1n << 20n))).toEqual([20, 200])
        })
    })
})
