// Hardcoded in the v2 Lottery contract as PEA_PER_ENTRY = 0.001 ether.
// Mirrored here only for display in surfaces that pre-date the on-chain
// `LGO.entryQuote` breakdown (e.g. copy that quotes "0.001 ETH per entry").
// For actual entry cost, prefer `useEntryQuote` which reads the contract.
export const PEA_PER_ENTRY_WEI = 1_000_000_000_000_000n // 0.001 ETH

// Hardcoded in the v2 Lottery contract as CF_BASIS_POINTS = 200 (2%).
export const CF_BASIS_POINTS = 200n

export const BASIS_POINTS_DIVISOR = 10_000n
