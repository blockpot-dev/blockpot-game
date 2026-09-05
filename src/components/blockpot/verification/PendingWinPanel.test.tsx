// BLO-683 Surface 2. A prize above what the player can currently claim.
//
// The framing is the whole surface: the prize is theirs, it is safe, and
// verification releases it. These tests pin that wording, because the failure
// mode here is not a crash — it is a well-meaning rewrite to "your prize is on
// hold pending verification", which says the opposite of what was settled.
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PendingWinPanel from './PendingWinPanel'

function renderPanel(escrowedEurMinor = 250_000, onVerify = vi.fn()) {
    render(<PendingWinPanel escrowedEurMinor={escrowedEurMinor} onVerify={onVerify} />)
    return { panel: screen.getByTestId('pending-win-panel'), onVerify }
}

describe('<PendingWinPanel>', () => {
    // Nothing about the prize is gated, only the exit. A hidden or rounded
    // figure would imply the prize itself is in question.
    it('shows the escrowed amount in full', () => {
        const { panel } = renderPanel(250_000)
        expect(panel.textContent).toContain('€2,500')
    })

    it('says the prize is safe and that verification releases it', () => {
        const { panel } = renderPanel()
        const text = panel.textContent ?? ''
        expect(text.length).toBeGreaterThan(20)
        expect(text).toMatch(/safe/i)
        expect(text).toMatch(/releases it/i)
    })

    it('never frames the prize as locked, held, or under review', () => {
        const { panel } = renderPanel()
        const text = panel.textContent ?? ''
        expect(text.length).toBeGreaterThan(20)
        expect(text).not.toMatch(/lock/i)
        expect(text).not.toMatch(/\bheld\b|\bhold\b/i)
        expect(text).not.toMatch(/review/i)
        expect(text).not.toMatch(/frozen|blocked|suspend/i)
    })

    it('uses claim vocabulary, never custody vocabulary', () => {
        const { panel } = renderPanel()
        const text = panel.textContent ?? ''
        expect(text.length).toBeGreaterThan(20)
        expect(text).not.toMatch(/withdraw/i)
        expect(text).not.toMatch(/deposit/i)
        expect(text).not.toMatch(/tier/i)
        expect(text).not.toMatch(/\bT[0-4]\b/)
    })

    it('starts the expedited flow from the call to action', async () => {
        const user = userEvent.setup()
        const { panel, onVerify } = renderPanel()
        await user.click(within(panel).getByRole('button', { name: /verify and claim/i }))
        expect(onVerify).toHaveBeenCalledTimes(1)
    })
})
