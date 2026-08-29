import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProblemGamblingResources from './ProblemGamblingResources'
import { SUPPORT_EMAIL } from '@/constants/support'

describe('<ProblemGamblingResources>', () => {
    it('never uses the prohibited custody vocabulary', () => {
        const { container } = render(<ProblemGamblingResources />)
        expect(container.textContent).not.toMatch(new RegExp(['de', 'posit'].join(''), 'i'))
        expect(screen.getByText(/loss limits/i)).toBeInTheDocument()
    })

    it('titles the section "Support and resources" and links the support mailbox', () => {
        render(<ProblemGamblingResources />)
        expect(screen.getByRole('heading', { name: 'Support and resources' })).toBeInTheDocument()
        expect(screen.getByText(new RegExp(SUPPORT_EMAIL))).toBeInTheDocument()
    })
})
