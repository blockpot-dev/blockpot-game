import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SelfExclusionConfirmDialog from './SelfExclusionConfirmDialog'
import { formatEndsAt } from './selfExclusionCopy'

const noop = () => { /* test */ }
const ENDS_AT = '2026-09-05T12:00:00.000Z'

describe('<SelfExclusionConfirmDialog>', () => {
    it('names the duration, the end date and the claim reassurance', () => {
        render(
            <SelfExclusionConfirmDialog
                open
                onOpenChange={noop}
                duration='7d'
                endsAt={ENDS_AT}
                onConfirm={noop}
            />,
        )
        expect(screen.getByText('Self-exclude for 7 days?')).toBeInTheDocument()
        const endLabel = formatEndsAt(ENDS_AT).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        expect(screen.getByText(new RegExp(endLabel))).toBeInTheDocument()
        expect(screen.getByText(/you can still claim prizes/i)).toBeInTheDocument()
        expect(screen.getByText(/can't be cancelled or shortened/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /self-exclude for 7 days/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument()
    })

    it('explains the review path for a permanent exclusion', () => {
        render(
            <SelfExclusionConfirmDialog
                open
                onOpenChange={noop}
                duration='permanent'
                endsAt={null}
                onConfirm={noop}
            />,
        )
        expect(screen.getByText('Self-exclude permanently?')).toBeInTheDocument()
        expect(screen.getByText(/review by the Blockpot team/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /self-exclude permanently/i })).toBeInTheDocument()
    })

    it('calls onConfirm and shows the pending label while submitting', () => {
        const onConfirm = vi.fn()
        const { rerender } = render(
            <SelfExclusionConfirmDialog
                open
                onOpenChange={noop}
                duration='7d'
                endsAt={ENDS_AT}
                onConfirm={onConfirm}
            />,
        )
        screen.getByRole('button', { name: /self-exclude for 7 days/i }).click()
        expect(onConfirm).toHaveBeenCalledTimes(1)
        rerender(
            <SelfExclusionConfirmDialog
                open
                onOpenChange={noop}
                duration='7d'
                endsAt={ENDS_AT}
                onConfirm={onConfirm}
                submitting
            />,
        )
        expect(screen.getByText(/setting up…/i)).toBeInTheDocument()
    })
})
