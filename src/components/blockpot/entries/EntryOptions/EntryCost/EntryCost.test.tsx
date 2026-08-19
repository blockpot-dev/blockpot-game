import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import EntryCost from './EntryCost'
import { PEA_PER_ENTRY_WEI } from '@/constants/protocol'
import type { Amounts } from '@/types/draw/tokens'

// EntryCost reads `currency` from useDisplayCurrency and the formatted price
// strings from useDisplayPrices. Both hooks are chainId / Chainlink /
// localStorage backed; we mock at the hook boundary so the badge resolves to a
// deterministic ETH-mode render and `prices.eth` reflects the entryCost amount.
vi.mock('@/hooks/utilities/useDisplayCurrency', () => ({
    default: () => ({
        currency: 'ETH' as const,
        cycle: vi.fn(),
        setCurrency: vi.fn(),
    }),
}))
vi.mock('@/hooks/utilities/useDisplayPrices', async () => {
    const { formatEtherMaxDecimalsGreedy } = await import('@/utilities/formatters')
    return {
        default: (wei: bigint) => ({
            eth: formatEtherMaxDecimalsGreedy(wei, 6),
            usd: '$0.00',
            eur: null,
            eurAvailable: false,
        }),
        availableCurrenciesFor: () => ['ETH', 'USD'],
    }
})

// useEntryQuote is the upstream hook whose uint16 clamp caused the task-71
// bug. EntryCost itself doesn't consume it — useEntryForm does, and pre-fix
// useEntryForm divided `quote.pea / entriesRawValue` to produce
// `amountPerEntry`. We mock it here at the boundary so any future refactor
// that wires useEntryQuote into EntryCost would land on a stub that returns
// the clamped quote, not real wagmi data.
vi.mock('@/hooks/contracts/lgo/useEntryQuote', () => ({
    default: vi.fn((amount: bigint) => {
        const clamped = amount > 0xffffn ? 0xffffn : amount
        const peaPerEntry = PEA_PER_ENTRY_WEI
        const pea = peaPerEntry * clamped
        return {
            quote: { total: pea, pea, cf: 0n, opFee: 0n },
            isLoading: false,
            isPlaceholderData: false,
        }
    }),
}))

function makeEntryCost(amount: bigint): Amounts {
    return {
        amount,
        amountFormatted: '0.001',
        fiat: 0n,
        fiatFormatted: '$0.00',
        nativeToken: 'ETH',
    }
}

describe('<EntryCost> — task 71 regression', () => {
    // The post-task-71 invariant: useEntryForm pins `amountPerEntry` to
    // PEA_PER_ENTRY_WEI, regardless of how many entries the user typed and
    // regardless of useEntryQuote's clamped per-call quote. The two cases
    // below render EntryCost with the value useEntryForm produces today; if a
    // future regression reverts useEntryForm to `quote.pea / entriesRawValue`,
    // the second assertion would fail because the saturated quote.pea divided
    // by entries above the clamp would produce ~0.000066 ETH.

    it('displays 0.001 ETH per entry at small entry counts (e.g. 5)', () => {
        render(<EntryCost entryCost={makeEntryCost(PEA_PER_ENTRY_WEI)} />)
        expect(screen.getByText('0.001')).toBeInTheDocument()
    })

    it('displays 0.001 ETH per entry above the uint16 clamp boundary (>65535)', () => {
        render(<EntryCost entryCost={makeEntryCost(PEA_PER_ENTRY_WEI)} />)
        expect(screen.getByText('0.001')).toBeInTheDocument()
    })
})
