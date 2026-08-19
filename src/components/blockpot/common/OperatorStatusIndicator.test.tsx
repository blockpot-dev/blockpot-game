import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OperatorStatusIndicator } from './OperatorStatusIndicator'
import { PlayerStatus } from '@/hooks/contracts/player-registry/usePlayerStatus'

// The pill reads four hooks: wagmi's useAccount, useIsOperatorApproved,
// usePlayerRegistration, and usePlayerStatus. Mocks live at the module
// boundary; the test rebinds the return shape per-case via mockReturnValue.
const useAccountMock = vi.fn()
vi.mock('wagmi', () => ({
    useAccount: () => useAccountMock(),
}))

const useIsOperatorApprovedMock = vi.fn()
vi.mock('@/hooks/contracts/approved-operator-registry/useIsOperatorApproved', () => ({
    default: () => useIsOperatorApprovedMock(),
}))

const usePlayerRegistrationMock = vi.fn()
vi.mock('@/hooks/contracts/player-registry/usePlayerRegistration', () => ({
    default: () => usePlayerRegistrationMock(),
}))

const usePlayerStatusMock = vi.fn()
vi.mock('@/hooks/contracts/player-registry/usePlayerStatus', async () => {
    const actual = await vi.importActual<typeof import('@/hooks/contracts/player-registry/usePlayerStatus')>(
        '@/hooks/contracts/player-registry/usePlayerStatus',
    )
    return {
        ...actual,
        default: (...args: unknown[]) => usePlayerStatusMock(...args),
    }
})

function setHooks(overrides: {
    isConnected?: boolean
    address?: `0x${string}` | undefined
    isWhitelisted?: boolean
    isWhitelistLoading?: boolean
    isActive?: boolean
    isActiveLoading?: boolean
    isPending?: boolean
    isFailed?: boolean
    playerStatus?: number | undefined
    isPlayerStatusLoading?: boolean
} = {}) {
    useAccountMock.mockReturnValue({
        isConnected: overrides.isConnected ?? false,
        address: overrides.address,
    })
    useIsOperatorApprovedMock.mockReturnValue({
        isWhitelisted: overrides.isWhitelisted ?? true,
        isLoading: overrides.isWhitelistLoading ?? false,
    })
    usePlayerRegistrationMock.mockReturnValue({
        isActive: overrides.isActive ?? false,
        isActiveLoading: overrides.isActiveLoading ?? false,
        isPending: overrides.isPending ?? false,
        isFailed: overrides.isFailed ?? false,
    })
    usePlayerStatusMock.mockReturnValue({
        status: overrides.playerStatus,
        isLoading: overrides.isPlayerStatusLoading ?? false,
    })
}

describe('<OperatorStatusIndicator>', () => {
    it('renders "Wallet disconnected" when the operator is whitelisted but no wallet is connected', () => {
        setHooks({
            isConnected: false,
            address: undefined,
            isWhitelisted: true,
        })
        render(<OperatorStatusIndicator />)
        expect(screen.getByText('Wallet disconnected')).toBeInTheDocument()
        expect(screen.queryByText('Connected')).not.toBeInTheDocument()
    })

    it('renders "Site unavailable" when the operator is not whitelisted, regardless of wallet connection', () => {
        setHooks({
            isConnected: true,
            address: '0x1111111111111111111111111111111111111111',
            isWhitelisted: false,
        })
        render(<OperatorStatusIndicator />)
        expect(screen.getByText('Site unavailable')).toBeInTheDocument()
        expect(screen.queryByText('Disconnected')).not.toBeInTheDocument()
    })

    it('renders "Ready" when whitelisted, connected, active, and no terminal player status', () => {
        setHooks({
            isConnected: true,
            address: '0x2222222222222222222222222222222222222222',
            isWhitelisted: true,
            isActive: true,
        })
        render(<OperatorStatusIndicator />)
        expect(screen.getByText('Ready')).toBeInTheDocument()
        expect(screen.queryByText('Connected')).not.toBeInTheDocument()
    })

    it('renders "Blocked" when the connected wallet has PlayerStatus.SUSPENDED', () => {
        setHooks({
            isConnected: true,
            address: '0x3333333333333333333333333333333333333333',
            isWhitelisted: true,
            isActive: true,
            playerStatus: PlayerStatus.SUSPENDED,
        })
        render(<OperatorStatusIndicator />)
        expect(screen.getByText('Blocked')).toBeInTheDocument()
        expect(screen.queryByText('Ready')).not.toBeInTheDocument()
    })

    it('renders "Blocked" when the connected wallet has PlayerStatus.BANNED', () => {
        setHooks({
            isConnected: true,
            address: '0x4444444444444444444444444444444444444444',
            isWhitelisted: true,
            isActive: true,
            playerStatus: PlayerStatus.BANNED,
        })
        render(<OperatorStatusIndicator />)
        expect(screen.getByText('Blocked')).toBeInTheDocument()
        expect(screen.queryByText('Ready')).not.toBeInTheDocument()
    })
})
