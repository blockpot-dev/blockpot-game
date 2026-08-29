import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import AccountDialogWalletTab from './AccountDialogWalletTab'
import type { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

// BLO-755: claim-flow copy and states on the Wallet tab. Wallet card and
// referral section are mocked at their hook boundaries; the tab itself is
// props-driven.
vi.mock('wagmi', () => ({
    useAccount: () => ({
        isConnected: true,
        address: '0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657',
        connector: { name: 'MetaMask' },
        chain: { id: 1, name: 'Ethereum' },
    }),
    useEnsName: () => ({ data: undefined }),
    useEnsAvatar: () => ({ data: undefined }),
    useBalance: () => ({ data: undefined }),
    useDisconnect: () => ({ disconnect: vi.fn() }),
    useChainId: () => 1,
}))

vi.mock('@/hooks/referral/useReferrerDashboard', () => ({
    default: () => ({ record: null, isLoading: false, isError: false, refetch: vi.fn(), claim: vi.fn(), isClaiming: false }),
}))

const T1_STATE: PlayerActivityState = {
    currentTier: 'T1',
    cumEnteredEurMinor: 100_00,
    cumWonEurMinor: 0,
    cumClaimsEurMinor: 0,
    largestSingleWinEurMinor: 0,
    inflow: { capEurMinor: 9_000_00, usedEurMinor: 100_00, headroomEurMinor: 8_900_00, ratio: 0.01 },
    outflow: { capEurMinor: 2_000_00, usedEurMinor: 0, headroomEurMinor: 2_000_00, ratio: 0 },
    nextTier: { tier: 'T2', missingGates: 0n, inflowCapEurMinor: null, outflowCapEurMinor: null },
    pendingClaimEurMinor: 0,
}

type Props = React.ComponentProps<typeof AccountDialogWalletTab>

function makeProps(over: Partial<Props> = {}): Props {
    return {
        state: T1_STATE,
        draw: true,
        prizePoolContext: undefined,
        eth: 0n,
        weth: 0n,
        enteredEurMinor: 100_00n,
        wonEurMinor: 0n,
        profitEurMinor: 0n,
        isCompliant: true,
        decision: null,
        isClaiming: false,
        claimRequestPending: false,
        opStatus: undefined,
        opError: undefined,
        onClaim: vi.fn(),
        onReleasePending: vi.fn(),
        onVerify: vi.fn(),
        onClearDecision: vi.fn(),
        onAfterDisconnect: vi.fn(),
        ...over,
    }
}

const ONE_ETH = 10n ** 18n

describe('<AccountDialogWalletTab> — claim states', () => {
    it('(a) zero balances render the empty state', () => {
        render(<AccountDialogWalletTab {...makeProps()} />)
        expect(screen.getByText(/nothing to claim yet/i)).toBeInTheDocument()
        expect(screen.getByText(/prizes appear here after a draw/i)).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /claim/i })).not.toBeInTheDocument()
    })

    it('(b) a SELF_EXCLUDED decision never renders "paused"', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
        const { container } = render(<AccountDialogWalletTab {...makeProps({
            eth: ONE_ETH,
            decision: { allow: false, reason: 'self-excluded', requiredAction: 'SELF_EXCLUDED' },
        })} />)
        expect(container.textContent).not.toMatch(/paused while a self.exclusion/i)
        expect(container.textContent).not.toMatch(/claims are paused/i)
        expect(screen.getByText(/claims aren't paused by self-exclusion/i)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /contact support/i })).toBeInTheDocument()
        expect(errorSpy).toHaveBeenCalled()
        errorSpy.mockRestore()
    })

    it('(c) op status PENDING renders "Claim in progress"', () => {
        render(<AccountDialogWalletTab {...makeProps({ eth: ONE_ETH, opStatus: 'PENDING' })} />)
        expect(screen.getByText(/claim in progress — this can take a minute/i)).toBeInTheDocument()
        expect(screen.queryByText(/operation in progress/i)).not.toBeInTheDocument()
    })

    it('labels the claim button "Claim prize" and "Claiming…" while in flight', () => {
        const { rerender } = render(<AccountDialogWalletTab {...makeProps({ eth: ONE_ETH })} />)
        expect(screen.getByRole('button', { name: /^claim prize$/i })).toBeEnabled()
        rerender(<AccountDialogWalletTab {...makeProps({ eth: ONE_ETH, isClaiming: true })} />)
        expect(screen.getByRole('button', { name: /^claiming…$/i })).toBeDisabled()
    })

    it('shows the amount in the label for a held-prize claim', () => {
        render(<AccountDialogWalletTab {...makeProps({
            eth: ONE_ETH,
            state: { ...T1_STATE, currentTier: 'T0', pendingClaimEurMinor: 600_00 },
        })} />)
        expect(screen.getByRole('button', { name: /^claim €600\.00 now$/i })).toBeInTheDocument()
        render(<AccountDialogWalletTab {...makeProps({
            eth: ONE_ETH,
            state: { ...T1_STATE, pendingClaimEurMinor: 600_00 },
        })} />)
        expect(screen.getByRole('button', { name: /^claim €600\.00$/i })).toBeInTheDocument()
    })

    it('renders the failed state with a retry action and support link, never the raw error', () => {
        const onClaim = vi.fn()
        render(<AccountDialogWalletTab {...makeProps({ eth: ONE_ETH, opStatus: 'FAILED', opError: 'ECONNRESET 0xdeadbeef', onClaim })} />)
        expect(screen.getByText(/claim didn't go through/i)).toBeInTheDocument()
        expect(screen.queryByText(/ECONNRESET/)).not.toBeInTheDocument()
        expect(screen.getByRole('link', { name: /contact support/i })).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: /^retry claim$/i }))
        expect(onClaim).toHaveBeenCalledOnce()
    })

    it('renders the non-compliant state with a Verify now action when there is a balance', () => {
        const onVerify = vi.fn()
        render(<AccountDialogWalletTab {...makeProps({ eth: ONE_ETH, isCompliant: false, onVerify })} />)
        expect(screen.getByText(/verification is needed before you can claim/i)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: /^verify now$/i }))
        expect(onVerify).toHaveBeenCalledOnce()
        expect(screen.queryByText(/nothing to claim yet/i)).not.toBeInTheDocument()
    })
})
