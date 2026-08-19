import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import WalletButton from './WalletButton'

// Disconnected branch: renders "Connect Wallet" and opens WalletOptionsDialog
// via useWalletOptionsDialogOpen().update(true).
// Connected branch: renders a single pill that opens AccountDialog on click
// and must NOT invoke useDisconnect().disconnect — regression guard for task
// 88, where the connected-state header chip used to wire onClick directly to
// disconnect, dropping the wallet session without confirmation.

const useAccountMock = vi.fn()
vi.mock('wagmi', () => ({
    useAccount: () => useAccountMock(),
    useDisconnect: () => ({ disconnect: disconnectMock }),
    useEnsName: () => ({ data: undefined }),
    useEnsAvatar: () => ({ data: undefined }),
}))

const disconnectMock = vi.fn()

const walletOptionsUpdateMock = vi.fn()
vi.mock('@/providers/ModalOpenStateProvider', () => ({
    useWalletOptionsDialogOpen: () => ({ value: false, update: walletOptionsUpdateMock }),
}))

// AccountDialog is heavy (wagmi reads, claim flow); mock to a tiny stub that
// exposes its `open` prop so we can assert WalletButton flipped it on click.
vi.mock('@/components/blockpot/account/AccountDialog', () => ({
    default: ({ open }: { open: boolean }) => (
        <div data-testid='account-dialog' data-open={open ? 'true' : 'false'} />
    ),
}))

// needsAttention reads four hooks (player activity, prize pool, draw, balances);
// mock each to a benign default so the connected-state branch renders without
// hitting wagmi/QueryClient.
vi.mock('@/hooks/player-summary/usePlayerActivityState', () => ({
    default: () => ({ state: undefined }),
}))
vi.mock('@/hooks/player-summary/usePrizePoolContext', () => ({
    default: () => ({ context: undefined }),
}))
vi.mock('@/providers/BlockpotDrawProvider', () => ({
    useBlockpotDraw: () => ({ draw: undefined }),
}))
vi.mock('@/hooks/utilities/useAccountAddress', () => ({
    default: () => '0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657',
}))
vi.mock('@/hooks/contracts/lgo/usePlayerBalances', () => ({
    default: () => ({ eth: 0n, weth: 0n }),
}))

describe('<WalletButton>', () => {
    it('case 1 — disconnected: renders Connect Wallet and opens WalletOptionsDialog on click', () => {
        useAccountMock.mockReturnValue({ isConnected: false })
        walletOptionsUpdateMock.mockClear()
        disconnectMock.mockClear()

        render(<WalletButton />)
        const button = screen.getByRole('button', { name: /connect wallet/i })
        fireEvent.click(button)

        expect(walletOptionsUpdateMock).toHaveBeenCalledWith(true)
        expect(disconnectMock).not.toHaveBeenCalled()
    })

    it('case 2 — connected: clicking the pill opens AccountDialog and does NOT call disconnect', () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
            address: '0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657',
            connector: { name: 'MetaMask' },
        })
        walletOptionsUpdateMock.mockClear()
        disconnectMock.mockClear()

        render(<WalletButton />)
        expect(screen.getByTestId('account-dialog')).toHaveAttribute('data-open', 'false')

        const pill = screen.getByRole('button')
        fireEvent.click(pill)

        expect(screen.getByTestId('account-dialog')).toHaveAttribute('data-open', 'true')
        expect(disconnectMock).not.toHaveBeenCalled()
    })
})
