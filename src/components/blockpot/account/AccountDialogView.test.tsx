import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountDialogView from './AccountDialogView'
import type { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'

// Mocking wagmi at the hook boundary keeps the wallet-card subtree alive
// without dragging the wagmi/Web3 providers into this dialog-level test —
// same trick as AccountDialogWalletSection.test.tsx.
const useAccountMock = vi.fn(() => ({
    isConnected: true,
    address: '0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657',
    connector: { name: 'MetaMask' },
    chain: { id: 1, name: 'Ethereum' },
}))

// The wallet tab renders the referral earnings section; mock it at its hook boundary
// (it is null for non-referrer wallets, which is the state these tests exercise).
vi.mock('@/hooks/referral/useReferrerDashboard', () => ({
    default: () => ({ record: null, isLoading: false, isError: false, refetch: vi.fn(), claim: vi.fn(), isClaiming: false }),
}))

// Surface 4 (VerificationStatusRow) now lives in the Verification tab and reads
// server state. Mock at the hook boundary rather than wrapping a QueryClient —
// same convention as the wagmi mock below. Default: the player has never been
// asked to verify, which is the state the tab is empty for.
const verificationState = vi.fn(() => ({
    data: { capProximity: null, firstVerificationContactAt: null as string | null },
}))
vi.mock('@/hooks/player/useVerificationState', () => ({
    default: () => verificationState(),
    useDismissNudge: () => ({ mutate: vi.fn(), isPending: false }),
    useRecordVerificationContact: () => ({ mutate: vi.fn() }),
}))

vi.mock('wagmi', () => ({
    useAccount: () => useAccountMock(),
    useEnsName: () => ({ data: undefined }),
    useEnsAvatar: () => ({ data: undefined }),
    useBalance: () => ({ data: { value: 1_000_000_000_000_000_000n, decimals: 18, symbol: 'ETH' } }),
    useDisconnect: () => ({ disconnect: vi.fn() }),
    useChainId: () => 1,
}))

const T0_STATE: PlayerActivityState = {
    currentTier: 'T0',
    cumEnteredEurMinor: 200_00,
    cumWonEurMinor: 1_500_00,
    cumClaimsEurMinor: 0,
    largestSingleWinEurMinor: 1_500_00,
    inflow: {
        capEurMinor: 900_00,
        usedEurMinor: 200_00,
        headroomEurMinor: 700_00,
        ratio: 200_00 / 900_00,
    },
    outflow: {
        capEurMinor: 500_00,
        usedEurMinor: 0,
        headroomEurMinor: 500_00,
        ratio: 0,
    },
    nextTier: {
        tier: 'T1',
        missingGates: 1n << 1n,
        inflowCapEurMinor: 2_000_00,
        outflowCapEurMinor: 2_000_00,
    },
    pendingClaimEurMinor: 600_00,
}

const T2_STATE: PlayerActivityState = {
    currentTier: 'T2',
    cumEnteredEurMinor: 9_500_00,
    cumWonEurMinor: 0,
    cumClaimsEurMinor: 0,
    largestSingleWinEurMinor: 0,
    inflow: {
        capEurMinor: 10_000_00,
        usedEurMinor: 9_500_00,
        headroomEurMinor: 500_00,
        ratio: 0.95,
    },
    outflow: {
        capEurMinor: 10_000_00,
        usedEurMinor: 0,
        headroomEurMinor: 10_000_00,
        ratio: 0,
    },
    nextTier: {
        tier: 'T3',
        missingGates: 1n << 4n,
        inflowCapEurMinor: null,
        outflowCapEurMinor: null,
    },
    pendingClaimEurMinor: 0,
}

const T1_STATE: PlayerActivityState = {
    currentTier: 'T1',
    cumEnteredEurMinor: 100_00,
    cumWonEurMinor: 0,
    cumClaimsEurMinor: 0,
    largestSingleWinEurMinor: 0,
    inflow: {
        capEurMinor: 9_000_00,
        usedEurMinor: 100_00,
        headroomEurMinor: 8_900_00,
        ratio: 100_00 / 9_000_00,
    },
    outflow: {
        capEurMinor: 2_000_00,
        usedEurMinor: 0,
        headroomEurMinor: 2_000_00,
        ratio: 0,
    },
    nextTier: {
        tier: 'T2',
        missingGates: 0n,
        inflowCapEurMinor: null,
        outflowCapEurMinor: null,
    },
    pendingClaimEurMinor: 0,
}

function makeProps(over: Partial<React.ComponentProps<typeof AccountDialogView>> = {}): React.ComponentProps<typeof AccountDialogView> {
    return {
        open: true,
        onOpenChange: vi.fn(),
        state: T1_STATE,
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
        ...over,
    }
}

describe('<AccountDialogView> — Wallet / Verification tabs', () => {
    it('renders the Wallet tab by default with lifetime stats', () => {
        render(<AccountDialogView {...makeProps()} />)

        expect(screen.getByText(/entered/i)).toBeInTheDocument()
        expect(screen.getByText(/^prizes$/i)).toBeInTheDocument()
        expect(screen.getByText(/^net$/i)).toBeInTheDocument()
    })

    it('switching to the Verification tab swaps the panel content', async () => {
        const user = userEvent.setup()
        render(<AccountDialogView {...makeProps()} />)

        await user.click(screen.getByRole('tab', { name: /verification/i }))

        // The Verification tab is deliberately empty for a player who has never
        // been asked for ID (BLO-675 Surface 4). What proves the swap is that
        // the wallet panel's content is gone, not that new copy appeared.
        expect(screen.queryByText(/profit/i)).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /disconnect/i })).not.toBeInTheDocument()
    })

    it('renders the wallet card inside the Wallet tab only, not on Verification', async () => {
        const user = userEvent.setup()
        render(<AccountDialogView {...makeProps()} />)

        // Wallet tab is default — card visible.
        expect(screen.getByText('0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument()

        // Switch to Verification — card gone.
        await user.click(screen.getByRole('tab', { name: /verification/i }))
        expect(screen.queryByText('0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /disconnect/i })).not.toBeInTheDocument()

        // Switch back — card returns.
        await user.click(screen.getByRole('tab', { name: /wallet/i }))
        expect(screen.getByText('0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument()
    })

    it('with state === undefined and loading renders the loading copy and no tab UI', () => {
        render(<AccountDialogView {...makeProps({ state: undefined, stateLoading: true })} />)

        expect(screen.getByText(/loading your account…/i)).toBeInTheDocument()
        expect(screen.queryByRole('tab', { name: /wallet/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('tab', { name: /verification/i })).not.toBeInTheDocument()
        expect(screen.queryByText(/entered/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/net entry headroom/i)).not.toBeInTheDocument()
    })

    it('with state === undefined and not loading renders the error copy with Retry', async () => {
        const user = userEvent.setup()
        const onRetryState = vi.fn()
        render(<AccountDialogView {...makeProps({ state: undefined, stateLoading: false, onRetryState })} />)

        expect(screen.getByText(/we couldn't load your account/i)).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /^retry$/i }))
        expect(onRetryState).toHaveBeenCalledOnce()
    })
})

// B-VIS-1/2: the tier ladder is invisible to players in Phase 1. Nothing in
// either tab may name a tier, a cap, an allowance, headroom, or a limit figure.
const LADDER_COPY = /Tier \d|T[0-4]\b|allowance|cap\b|headroom|limit €/

describe('<AccountDialogView> — no tier ladder on any player surface', () => {
    beforeEach(() => {
        window.sessionStorage.clear()
    })

    it.each([
        ['T0', T0_STATE, 150_000_000_000_000_000n],
        ['T2', T2_STATE, 0n],
    ] as const)('renders no tier, cap, allowance, headroom or limit copy for a %s player', async (_label, state, eth) => {
        const user = userEvent.setup()
        const { container } = render(<AccountDialogView {...makeProps({ state, eth, isCompliant: false })} />)

        expect(container.textContent).not.toMatch(LADDER_COPY)

        await user.click(screen.getByRole('tab', { name: /verification/i }))
        expect(container.textContent).not.toMatch(LADDER_COPY)
    })

    // Replaces "shows the gates still missing and a single Verify now CTA".
    // That behaviour is gone: the gate-by-gate checklist was the ladder, and
    // BLO-675 removed it. A player who has never been asked for ID now finds
    // nothing verification-shaped anywhere, which is the point.
    it('shows nothing on the Verification tab before the player has been asked for ID', async () => {
        const user = userEvent.setup()
        render(<AccountDialogView {...makeProps({ state: { ...T0_STATE, pendingClaimEurMinor: 0 } })} />)

        await user.click(screen.getByRole('tab', { name: /verification/i }))
        expect(screen.queryByText('Identity')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /^verify now$/i })).not.toBeInTheDocument()
        expect(screen.queryByTestId('verification-status-row')).not.toBeInTheDocument()
    })

    // The one thing that does appear, and only after first contact.
    it('shows the resume row once the player has been asked', async () => {
        const user = userEvent.setup()
        const onVerify = vi.fn()
        verificationState.mockReturnValue({
            data: { capProximity: null, firstVerificationContactAt: '2026-09-05T00:00:00Z' },
        })
        render(<AccountDialogView {...makeProps({ state: { ...T0_STATE, pendingClaimEurMinor: 0 }, onVerify })} />)

        await user.click(screen.getByRole('tab', { name: /verification/i }))
        expect(screen.getByTestId('verification-status-row')).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'CONTINUE' }))
        expect(onVerify).toHaveBeenCalledOnce()
    })

    // Replaces the old client-side proximity nudge, which derived the crossing
    // from PlayerActivityState and remembered the dismissal in sessionStorage.
    // Both are gone: the crossing and the dismissal are server state now
    // (BLO-679, Surface 3), because a sessionStorage dismissal comes back every
    // new session and on every other device — which is not "at most once".
    it('derives no proximity nudge from client state, and stores no dismissal locally', async () => {
        const user = userEvent.setup()
        render(<AccountDialogView {...makeProps({ state: T2_STATE })} />)

        await user.click(screen.getByRole('tab', { name: /verification/i }))
        expect(screen.queryByText(/close to a limit/i)).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
        expect(window.sessionStorage.getItem('blockpot.proximityNudgeDismissed')).toBeNull()
    })
})
