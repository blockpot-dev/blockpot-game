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
    default: () => ({ record: null, claim: vi.fn(), isClaiming: false }),
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
        draw: false,
        prizePoolContext: undefined,
        kycGates: {},
        onChainGates: 0n,
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
        expect(screen.getByText(/prizes/i)).toBeInTheDocument()
        expect(screen.getByText(/^net$/i)).toBeInTheDocument()
    })

    it('switching to the Verification tab swaps the panel content', async () => {
        const user = userEvent.setup()
        render(<AccountDialogView {...makeProps()} />)

        await user.click(screen.getByRole('tab', { name: /verification/i }))

        expect(screen.getByText(/some prizes need identity verification/i)).toBeInTheDocument()
        expect(screen.queryByText(/profit/i)).not.toBeInTheDocument()
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

    it('with state === undefined renders the fallback copy and no tab UI', () => {
        render(<AccountDialogView {...makeProps({ state: undefined })} />)

        expect(screen.getByText(/player status will appear once your wallet is connected/i)).toBeInTheDocument()
        expect(screen.queryByRole('tab', { name: /wallet/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('tab', { name: /verification/i })).not.toBeInTheDocument()
        expect(screen.queryByText(/entered/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/net entry headroom/i)).not.toBeInTheDocument()
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

    it('shows the gates still missing and a single Verify now CTA on the Verification tab', async () => {
        const user = userEvent.setup()
        const onVerify = vi.fn()
        // No held prize and under the 90% nudge, so the only Verify now is the checklist's.
        render(<AccountDialogView {...makeProps({ state: { ...T0_STATE, pendingClaimEurMinor: 0 }, onVerify })} />)

        await user.click(screen.getByRole('tab', { name: /verification/i }))
        expect(screen.getByText('Identity')).toBeInTheDocument()
        expect(screen.queryByRole('tab', { name: /tier/i })).not.toBeInTheDocument()

        const ctas = screen.getAllByRole('button', { name: /^verify now$/i })
        expect(ctas).toHaveLength(1)
        await user.click(ctas[0])
        expect(onVerify).toHaveBeenCalledOnce()
    })

    it('shows exactly one dismissible proximity nudge at 90% and remembers the dismissal', async () => {
        const user = userEvent.setup()
        render(<AccountDialogView {...makeProps({ state: T2_STATE })} />)

        await user.click(screen.getByRole('tab', { name: /verification/i }))
        const nudge = screen.getByText(/you're close to a limit that needs verification/i)
        expect(nudge).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /dismiss/i }))
        expect(screen.queryByText(/you're close to a limit that needs verification/i)).not.toBeInTheDocument()
        expect(window.sessionStorage.getItem('blockpot.proximityNudgeDismissed')).toBe('1')
    })
})
