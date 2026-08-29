import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import AccountDialogView from './AccountDialogView'

// The Wallet section at the top of AccountDialogView is the canonical
// detail surface for the wallet identity: full address, ENS, chain, connector,
// balance, and the only Disconnect entry point. This test pins each fact down
// at the hook boundary and asserts the resulting render.

const useAccountMock = vi.fn()
const useEnsNameMock = vi.fn()
const useBalanceMock = vi.fn()
const disconnectMock = vi.fn()

vi.mock('wagmi', () => ({
    useAccount: () => useAccountMock(),
    useEnsName: () => useEnsNameMock(),
    useEnsAvatar: () => ({ data: undefined }),
    useBalance: () => useBalanceMock(),
    useDisconnect: () => ({ disconnect: disconnectMock }),
    useChainId: () => 1,
}))

const FULL_ADDRESS = '0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657'

function makeProps(): React.ComponentProps<typeof AccountDialogView> {
    return {
        open: true,
        onOpenChange: vi.fn(),
        state: undefined,
        draw: false,
        prizePoolContext: undefined,
        kycGates: undefined,
        onChainGates: 0n,
        eth: 0n,
        weth: 0n,
        enteredEurMinor: 0n,
        wonEurMinor: 0n,
        profitEurMinor: 0n,
        isCompliant: false,
        decision: null,
        isClaiming: false,
        claimRequestPending: false,
        opStatus: undefined,
        opError: undefined,
        onClaim: vi.fn(),
        onReleasePending: vi.fn(),
        onVerify: vi.fn(),
        onClearDecision: vi.fn(),
    }
}

describe('<AccountDialogView> — Wallet section', () => {
    it('renders the full address, ENS line, chain · connector, balance, and [Disconnect]', () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
            address: FULL_ADDRESS,
            connector: { name: 'MetaMask' },
            chain: { id: 1, name: 'Ethereum' },
        })
        useEnsNameMock.mockReturnValue({ data: 'vitalik.eth' })
        // wagmi v2 useBalance returns { value, decimals, symbol } — the
        // component derives the human-readable string via formatEther.
        useBalanceMock.mockReturnValue({ data: { value: 1_234_000_000_000_000_000n, decimals: 18, symbol: 'ETH' } })
        disconnectMock.mockClear()

        render(<AccountDialogView {...makeProps()} />)

        // (a) full address visible
        expect(screen.getByText(FULL_ADDRESS)).toBeInTheDocument()
        // (b) ENS line
        expect(screen.getByText('vitalik.eth')).toBeInTheDocument()
        // (c) connector name
        expect(screen.getByText(/MetaMask/)).toBeInTheDocument()
        // (d) formatted balance — assert digits + symbol independently to avoid
        // brittle whitespace coupling inside the span structure
        expect(screen.getByText(/1\.234/)).toBeInTheDocument()
        expect(screen.getAllByText(/ETH/).length).toBeGreaterThan(0)

        // (e) Disconnect button triggers useDisconnect().disconnect
        const disconnectBtn = screen.getByRole('button', { name: /disconnect/i })
        fireEvent.click(disconnectBtn)
        expect(disconnectMock).toHaveBeenCalledTimes(1)
    })
})
