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
        mockUseIsOperatorApproved.mockReturnValue({ isWhitelisted: false, isLoading: true })
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
        expect(alert).toHaveTextContent('Entries disabled')
        expect(alert).toHaveTextContent('this operator is not approved in the ApprovedOperatorRegistry')
        expect(alert).toHaveTextContent('Contact the operator to resolve')
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
