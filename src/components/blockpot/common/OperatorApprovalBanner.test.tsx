import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import OperatorApprovalBanner from './OperatorApprovalBanner'

const mockUseIsOperatorApproved = vi.fn()

vi.mock('@/hooks/contracts/approved-operator-registry/useIsOperatorApproved', () => ({
    default: () => mockUseIsOperatorApproved(),
}))

describe('OperatorApprovalBanner', () => {
    beforeEach(() => {
        mockUseIsOperatorApproved.mockReset()
    })

    it('renders nothing while the approval check is loading', () => {
        mockUseIsOperatorApproved.mockReturnValue({ isWhitelisted: undefined, isLoading: true })
        const { container } = render(<OperatorApprovalBanner />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing on a transient read error (isWhitelisted undefined)', () => {
        mockUseIsOperatorApproved.mockReturnValue({ isWhitelisted: undefined, isLoading: false, isError: true })
        const { container } = render(<OperatorApprovalBanner />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing once the operator is approved', () => {
        mockUseIsOperatorApproved.mockReturnValue({ isWhitelisted: true, isLoading: false })
        const { container } = render(<OperatorApprovalBanner />)
        expect(container).toBeEmptyDOMElement()
    })

    it('warns that the operator is not approved, without claiming licensure', () => {
        mockUseIsOperatorApproved.mockReturnValue({ isWhitelisted: false, isLoading: false })
        render(<OperatorApprovalBanner />)

        const alert = screen.getByRole('alert')
        expect(alert).toHaveTextContent('Entries are closed')
        expect(alert).toHaveTextContent('Blockpot isn\'t currently approved to run draws')
        expect(alert).toHaveTextContent('We\'ll reopen as soon as it\'s resolved')
        expect(alert.textContent).not.toMatch(/ApprovedOperatorRegistry/)
    })

    it('never uses retired licensure or lottery vocabulary', () => {
        mockUseIsOperatorApproved.mockReturnValue({ isWhitelisted: false, isLoading: false })
        render(<OperatorApprovalBanner />)

        const text = screen.getByRole('alert').textContent ?? ''
        expect(text).not.toMatch(/licen[cs]ed/i)
        expect(text).not.toMatch(/gaming/i)
        expect(text).not.toMatch(/\bLGO\b/)
        expect(text).not.toMatch(/ComplianceRegistry/)
    })
})
