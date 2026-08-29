// Mirror of `block-pot-gaming-service/internal/gates/store.go::BitPosition`
// (which itself sources from `internal/chain/kycregistry::Gate*` constants).
// Bit positions are a locked invariant per `plan/PLAN.md` "Cross-repo
// coordination rules" — adding a gate requires updating BOTH this table and
// the gaming-service one in the same change set; bit reassignments are a
// contract migration. The keys here MUST stay in sync with the union members
// of `GateType` in `src/hooks/player/usePlayerKyc.ts`.

import type { GateType } from '@/hooks/player/usePlayerKyc'

export const GATE_BIT_POSITION: Record<GateType, number> = {
    wallet_owned: 0,
    photo_id: 1,
    proof_of_address: 2,
    sof_declared: 3,
    sof_documented: 4,
    sow_light: 5,
    sow_forensic: 6,
    pep_screened_clear: 7,
    sanctions_screened_clear: 8,
    adverse_media_clear: 9,
    enhanced_address_proof: 10,
    video_kyc: 11,
    employer_verification: 12,
    bank_account_verified: 13,
    tax_residency_documented: 14,
}

export type GateDisplay = { label: string, description: string }

export const GATE_DISPLAY: Record<GateType, GateDisplay> = {
    wallet_owned: { label: 'Wallet ownership', description: 'Sign a message to prove you control this wallet' },
    photo_id: { label: 'Identity', description: 'Photo ID and a quick selfie check' },
    proof_of_address: { label: 'Address', description: 'Proof of residence' },
    sof_declared: { label: 'Source of funds', description: 'Self-declared source of funds' },
    sof_documented: { label: 'Source of funds', description: 'How you funded this account' },
    sow_light: { label: 'Source of wealth', description: 'A short review of where your wealth comes from' },
    sow_forensic: { label: 'Detailed review', description: 'A detailed review of where your wealth comes from' },
    pep_screened_clear: { label: 'Public-office check', description: 'Check whether you hold or held public office' },
    sanctions_screened_clear: { label: 'Sanctions screening', description: 'Sanctions list check' },
    adverse_media_clear: { label: 'Adverse media', description: 'Negative media check' },
    enhanced_address_proof: { label: 'Enhanced address proof', description: 'Notarised proof of residence' },
    video_kyc: { label: 'Video verification', description: 'A short live video call' },
    employer_verification: { label: 'Employer verification', description: 'Confirm your employer' },
    bank_account_verified: { label: 'Bank account', description: 'Verify a personal bank account' },
    tax_residency_documented: { label: 'Tax residency', description: 'Document your country of tax residence' },
}

// Returns the gates whose bits are set in `bitmap`, sorted by
// GATE_BIT_POSITION ascending so the requirements list reads from "easy"
// to "hard" deterministically across renders. Safe on the empty bitmap
// (T0 → []).
export function gatesFromBitmask(bitmap: bigint): GateType[] {
    const matches: { gate: GateType, bit: number }[] = []
    for (const [gate, bit] of Object.entries(GATE_BIT_POSITION) as [GateType, number][]) {
        if ((bitmap & (1n << BigInt(bit))) !== 0n) {
            matches.push({ gate, bit })
        }
    }
    matches.sort((a, b) => a.bit - b.bit)
    return matches.map((m) => m.gate)
}

const KNOWN_GATE_BITS = new Set<number>(Object.values(GATE_BIT_POSITION))

// Set bits in `bitmap` that GATE_BIT_POSITION does not cover, ascending.
// Non-empty means the chain policy knows a gate this build does not —
// callers must surface these instead of dropping them, otherwise a tier's
// requirement list renders as falsely complete (the task-91 bit-14 bug).
export function unknownGateBits(bitmap: bigint): number[] {
    const bits: number[] = []
    for (let bit = 0; bit < 256; bit++) {
        if ((bitmap & (1n << BigInt(bit))) !== 0n && !KNOWN_GATE_BITS.has(bit)) {
            bits.push(bit)
        }
    }
    return bits
}
