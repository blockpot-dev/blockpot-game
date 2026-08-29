// BLO-759: /verify reads "Verify your identity", never accepts a T4 target,
// maps SIWE failures to plain copy, and reports completion without a tier code.
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { UserRejectedRequestError } from 'viem'
import { renderWithProviders } from '@/test/renderWithProviders'
import { KycVerificationContent } from '@/components/kyc/KycVerificationView'
import { Route, VerifyPageContent } from './verify'

const siweMock = vi.fn()
vi.mock('@/hooks/contracts/player-registry/useSiweSignature', () => ({
    default: () => siweMock(),
}))
vi.mock('@/hooks/utilities/useAccountAddress', () => ({
    default: () => '0x1111111111111111111111111111111111111111',
}))
vi.mock('@/providers/PlayerSessionProvider', () => ({
    usePlayerSession: () => ({ session: null, setSession: vi.fn() }),
}))
vi.mock('@/providers/ModalOpenStateProvider', () => ({
    useWalletOptionsDialogOpen: () => ({ value: false, update: vi.fn() }),
}))
vi.mock('@/components/kyc/KycVerificationView', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/components/kyc/KycVerificationView')>()
    return { ...mod, default: () => <div>kyc-view</div> }
})

function siweState(overrides: Record<string, unknown>) {
    return { isError: false, error: null, isPending: false, mutate: vi.fn(), ...overrides }
}

describe('/verify', () => {
    it('renders the H1 "Verify your identity"', async () => {
        siweMock.mockReturnValue(siweState({}))
        renderWithProviders(<VerifyPageContent tier={undefined} returnTo={undefined} />)
        expect(await screen.findByRole('heading', { level: 1, name: 'Verify your identity' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'SIGN IN WITH WALLET' })).toBeInTheDocument()
    })

    it('rejects ?tier=T4 in the search validator', () => {
        const validate = Route.options.validateSearch as (s: Record<string, unknown>) => { tier?: string }
        expect(validate({ tier: 'T4' }).tier).toBeUndefined()
        expect(validate({ tier: 'T2' }).tier).toBe('T2')
    })

    it('maps a wallet rejection to "Sign-in was cancelled. Try again."', async () => {
        siweMock.mockReturnValue(siweState({
            isError: true,
            error: new UserRejectedRequestError(new Error('User rejected the request.')),
        }))
        renderWithProviders(<VerifyPageContent tier={undefined} returnTo={undefined} />)
        expect(await screen.findByText('Sign-in was cancelled. Try again.')).toBeInTheDocument()
        expect(screen.queryByText(/User rejected/)).toBeNull()
    })

    it('maps any other SIWE failure to plain copy', async () => {
        siweMock.mockReturnValue(siweState({ isError: true, error: new Error('ECONNREFUSED nonce') }))
        renderWithProviders(<VerifyPageContent tier={undefined} returnTo={undefined} />)
        expect(await screen.findByText('We couldn\'t sign you in. Check your wallet and try again.')).toBeInTheDocument()
        expect(screen.queryByText(/ECONNREFUSED/)).toBeNull()
    })

    it('completion renders "You\'re verified" and no tier code', async () => {
        const { container } = renderWithProviders(
            <KycVerificationContent targetTier='T2' status={undefined} onChainTier='T2' onRefresh={() => {}} />,
        )
        expect(await screen.findByRole('heading', { level: 2, name: /You.re verified/ })).toBeInTheDocument()
        expect(container.textContent).not.toMatch(/\bT[0-4]\b|Tier \d/)
    })
})
