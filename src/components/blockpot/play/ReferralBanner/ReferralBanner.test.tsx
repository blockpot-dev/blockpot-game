import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const bindingState: { configured: boolean, referrer: `0x${string}` | null, isLoading: boolean } = {
    configured: true,
    referrer: null,
    isLoading: false
}
vi.mock('@/hooks/referral/useReferralBinding', () => ({
    default: () => bindingState
}))

const pendingState = { code: '', setCode: vi.fn((v: string) => { pendingState.code = v }), clear: vi.fn() }
vi.mock('@/hooks/referral/usePendingReferralCode', () => ({
    default: () => pendingState
}))

const checkState: { status: 'idle' | 'valid' | 'invalid' | 'inactive' } = { status: 'idle' }
vi.mock('@/hooks/referral/useReferralCodeCheck', () => ({
    default: () => checkState
}))

const { default: ReferralBanner } = await import('./ReferralBanner')

const JOE = '0x1111111111111111111111111111111111111111' as `0x${string}`

describe('ReferralBanner', () => {
    it('renders nothing when the ReferralManager is not configured', () => {
        bindingState.configured = false
        const { container } = render(<ReferralBanner />)
        expect(container).toBeEmptyDOMElement()
        bindingState.configured = true
    })

    it('shows the bound referrer instead of the code field once attributed', () => {
        bindingState.referrer = JOE
        render(<ReferralBanner />)
        expect(screen.getByText(/referred by/i)).toBeInTheDocument()
        expect(screen.queryByLabelText(/referral code/i)).toBeNull()
        bindingState.referrer = null
    })

    it('lets an unbound player type a code', () => {
        pendingState.code = ''
        render(<ReferralBanner />)
        expect(screen.queryByLabelText(/referral code/i)).toBeNull()
        fireEvent.click(screen.getByRole('button', { name: /have a referral code/i }))
        const input = screen.getByLabelText(/referral code/i)
        fireEvent.change(input, { target: { value: 'CRYPTOJOE' } })
        expect(pendingState.setCode).toHaveBeenCalledWith('CRYPTOJOE')
    })

    it('warns fail-soft on an unknown code without blocking entry', () => {
        pendingState.code = 'NOSUCH'
        checkState.status = 'invalid'
        render(<ReferralBanner />)
        expect(screen.getByText(/doesn.t match an active referrer/i)).toBeInTheDocument()
        expect(screen.getByText(/entries still go through/i)).toBeInTheDocument()
        checkState.status = 'idle'
    })

    it('confirms a valid code', () => {
        pendingState.code = 'CRYPTOJOE'
        checkState.status = 'valid'
        render(<ReferralBanner />)
        expect(screen.getByText(/entries will support/i)).toBeInTheDocument()
        checkState.status = 'idle'
    })
})
