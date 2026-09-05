// BLO-683 Surface 4. The settings row that exists only after first contact.
//
// The test that matters most is the absent one. This is the last place a
// standing verification menu could creep back in, and "renders nothing for a
// player who has never been asked" is the behaviour, not an edge case.
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VerificationStatusRow from './VerificationStatusRow'
import type { VerificationState } from '@/hooks/player/useVerificationState'

const state = vi.fn<() => { data: VerificationState | undefined }>()

vi.mock('@/hooks/player/useVerificationState', () => ({
    default: () => state(),
}))

function withContact(firstVerificationContactAt: string | null) {
    state.mockReturnValue({ data: { capProximity: null, firstVerificationContactAt } })
}

beforeEach(() => state.mockReset())

describe('<VerificationStatusRow>', () => {
    it('renders nothing before first contact', () => {
        withContact(null)
        render(<VerificationStatusRow onVerify={vi.fn()} />)
        expect(screen.queryByTestId('verification-status-row')).not.toBeInTheDocument()
        // Nothing at all — not an empty state, not a "not yet verified" line.
        // A player who has never been asked should find no evidence in the
        // product that an identity system exists.
        expect(document.body.textContent).toBe('')
    })

    it('renders nothing while the state is loading', () => {
        state.mockReturnValue({ data: undefined })
        render(<VerificationStatusRow onVerify={vi.fn()} />)
        expect(screen.queryByTestId('verification-status-row')).not.toBeInTheDocument()
    })

    it('renders once the player has been asked', () => {
        withContact('2026-09-05T00:00:00Z')
        render(<VerificationStatusRow onVerify={vi.fn()} />)
        expect(screen.getByTestId('verification-status-row')).toBeInTheDocument()
    })

    it('resumes the flow from the row', async () => {
        const user = userEvent.setup()
        const onVerify = vi.fn()
        withContact('2026-09-05T00:00:00Z')
        render(<VerificationStatusRow onVerify={onVerify} />)
        await user.click(screen.getByRole('button', { name: 'CONTINUE' }))
        expect(onVerify).toHaveBeenCalledTimes(1)
    })

    it('names no tier, level, or custody vocabulary', () => {
        withContact('2026-09-05T00:00:00Z')
        render(<VerificationStatusRow onVerify={vi.fn()} />)
        const text = screen.getByTestId('verification-status-row').textContent ?? ''
        expect(text.length).toBeGreaterThan(20)
        expect(text).not.toMatch(/tier/i)
        expect(text).not.toMatch(/\bT[0-4]\b/)
        expect(text).not.toMatch(/\blevel\b/i)
        expect(text).not.toMatch(/withdraw|deposit/i)
        // Not a status badge: it must not tell the player they are "verified"
        // or "unverified", which is the ladder in one word.
        expect(text).not.toMatch(/unverified|not verified/i)
    })
})
