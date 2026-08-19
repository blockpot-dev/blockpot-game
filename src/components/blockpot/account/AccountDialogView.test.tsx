import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountDialogView from './AccountDialogView'
import type { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'
import type { TierPolicy } from '@/hooks/contracts/kyc/useActivePolicy'

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

const UINT256_MAX = (1n << 256n) - 1n

const TIERS: TierPolicy[] = [
    { requiredGates: 0n, inflowCapEurMinor: 900_00n, outflowCapEurMinor: 500_00n },
    { requiredGates: 0n, inflowCapEurMinor: 9_000_00n, outflowCapEurMinor: 2_000_00n },
    { requiredGates: 0n, inflowCapEurMinor: UINT256_MAX, outflowCapEurMinor: UINT256_MAX },
]

const T1_STATE: PlayerActivityState = {
    currentTier: 'T1',
    cumWageredEurMinor: 100_00,
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
        jackpotContext: undefined,
        kycGates: {},
        onChainGates: 0n,
        tiers: TIERS,
        eth: 0n,
        weth: 0n,
        wageredEurMinor: 100_00n,
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
    it('renders the Wallet tab by default with lifetime stats and no flow card', () => {
        render(<AccountDialogView {...makeProps()} />)

        expect(screen.getByText(/entered/i)).toBeInTheDocument()
        expect(screen.getByText(/won/i)).toBeInTheDocument()
        expect(screen.getByText(/profit/i)).toBeInTheDocument()
        expect(screen.queryByRole('group', { name: /net flow/i })).not.toBeInTheDocument()
    })

    it('switching to the Verification tab swaps the panel content', async () => {
        const user = userEvent.setup()
        render(<AccountDialogView {...makeProps()} />)

        await user.click(screen.getByRole('tab', { name: /verification/i }))

        expect(screen.getByRole('group', { name: /net flow/i })).toBeInTheDocument()
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
