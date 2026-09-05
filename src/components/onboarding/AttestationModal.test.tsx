// BLO-682: registration gate v2. The modal collects DOB + terms only — there is
// no country field anywhere in the flow, because a self-declared country is
// trivially false as a control and potent as evidence against us. Eligibility
// is decided server-side on resolved country (BLO-678), and the modal's job is
// to render the three refusals it can come back with, neutrally.
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AttestationModal, { type AttestationFormValue } from './AttestationModal'
import type { CurrentTos } from '@/hooks/tos/useCurrentTos'

const tos: CurrentTos = {
    versionHash: '0xabc',
    versionLabel: '2026-09-04',
    bodyMarkdown: 'Terms body',
    effectiveFrom: '2026-09-04T00:00:00Z',
}

function renderModal(props: Partial<React.ComponentProps<typeof AttestationModal>> = {}) {
    const onConfirm = vi.fn()
    render(
        <AttestationModal
            open
            onOpenChange={vi.fn()}
            tos={tos}
            tosLoading={false}
            onConfirm={onConfirm}
            {...props}
        />,
    )
    return { onConfirm }
}

async function fillDob(user: ReturnType<typeof userEvent.setup>) {
    // Each Combobox is a listbox trigger; pick the first option that matches.
    const selects = screen.getAllByRole('combobox')
    await user.click(selects[0])
    await user.click(await screen.findByRole('option', { name: '01' }))
    await user.click(selects[1])
    await user.click(await screen.findByRole('option', { name: 'January' }))
    await user.click(selects[2])
    const years = await screen.findAllByRole('option')
    await user.click(years[0])
}

describe('AttestationModal — registration gate v2', () => {
    // (a) no country field anywhere
    it('renders no country field', () => {
        renderModal()
        expect(screen.queryByText(/country of residence/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/select your country/i)).not.toBeInTheDocument()
        // Three comboboxes exactly: day, month, year. A fourth would be country.
        expect(screen.getAllByRole('combobox')).toHaveLength(3)
    })

    // (b) submission carries DOB + TOS hash only
    it('confirms with dob and tosVersionHash only, with no jurisdiction key', async () => {
        const user = userEvent.setup()
        const { onConfirm } = renderModal()
        await fillDob(user)
        await user.click(screen.getByRole('checkbox'))
        await user.click(screen.getByRole('button', { name: /agree & continue/i }))

        expect(onConfirm).toHaveBeenCalledTimes(1)
        const value = onConfirm.mock.calls[0][0] as AttestationFormValue
        expect(Object.keys(value).sort()).toEqual(['dob', 'tosVersionHash'])
        expect(value.tosVersionHash).toBe('0xabc')
        expect(value).not.toHaveProperty('jurisdiction')
    })

    // (c) + (d) the three server refusals render neutrally
    it('renders the jurisdiction refusal without naming the resolved country', () => {
        renderModal({ refusal: 'JURISDICTION_BLOCKED' })
        const alert = screen.getByRole('alert')
        expect(alert).toHaveTextContent(/not available where you are/i)
        // Neutral: no country name or code is echoed back to the visitor.
        expect(alert.textContent).not.toMatch(/\b[A-Z]{2}\b/)
    })

    it('renders the underage refusal', () => {
        renderModal({ refusal: 'UNDERAGE' })
        expect(screen.getByRole('alert')).toHaveTextContent(/old enough/i)
    })

    it('renders the sanctions refusal without explaining the screen', () => {
        renderModal({ refusal: 'SANCTIONS_REFUSAL' })
        const alert = screen.getByRole('alert')
        expect(alert).toHaveTextContent(/cannot open an account/i)
        expect(alert.textContent).not.toMatch(/sanction/i)
    })

    it('hides the form once a refusal is shown', () => {
        renderModal({ refusal: 'JURISDICTION_BLOCKED' })
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /agree & continue/i })).not.toBeInTheDocument()
    })

    // (e) forward disclosure, in claim language
    it('shows the forward-disclosure line using claim language', () => {
        renderModal()
        const disclosure = screen.getByTestId('attestation-forward-disclosure')
        expect(disclosure).toHaveTextContent(/identity verification/i)
        expect(disclosure).toHaveTextContent(/larger claims/i)
        expect(disclosure).toHaveTextContent(/all accounts/i)
        // Never custody framing.
        expect(disclosure.textContent).not.toMatch(/withdraw/i)
        expect(disclosure.textContent).not.toMatch(/deposit/i)
    })
})
