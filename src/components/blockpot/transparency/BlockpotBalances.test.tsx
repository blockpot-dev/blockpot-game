import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { _BlockpotBalances } from './BlockpotBalances'

// The panel must source the funds-manager address from useBalanceAllocations
// (derived on-chain), not from the static getContractAddress lookup. We mock
// the hook to return a distinctive address and an unconfigured chainId so the
// old static path would resolve to ZERO_ADDRESS — reproducing the bug.
const DERIVED = '0xb4dC171C0edEc8C0032cd0f2d30921c09FA35e34'

vi.mock('@/hooks/contracts/transparency/useBalanceAllocations', () => ({
    default: () => ({
        pot: 1n,
        nextPot: 2n,
        parentGame: 3n,
        contractBalance: 6n,
        fundsManagerAddress: DERIVED,
    }),
}))
vi.mock('@/hooks/web3/useNativeCurrency', () => ({ default: () => 'ETH' }))
vi.mock('wagmi', () => ({ useChainId: () => 999999 }))

describe('<BlockpotBalances>', () => {
    it('renders the on-chain-derived funds-manager address, not a static/zero one', async () => {
        renderWithProviders(<_BlockpotBalances />)

        // Address is displayed upper-cased; match case-insensitively. Awaited
        // because the in-memory router renders the route on a microtask.
        expect(await screen.findByText(new RegExp(DERIVED, 'i'))).toBeInTheDocument()
        expect(screen.queryByText(/0x0{40}/i)).not.toBeInTheDocument()
    })
})
