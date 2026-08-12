import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CoolOffStatusBanner from './CoolOffStatusBanner'
import { deriveCoolOffStatus } from './coolOffStatus'

const NOW_SECONDS = 1_750_000_000

describe('deriveCoolOffStatus', () => {
    it('is not cooling off for 0 or past timestamps', () => {
        expect(deriveCoolOffStatus(0n, NOW_SECONDS).isCoolingOff).toBe(false)
        expect(deriveCoolOffStatus(BigInt(NOW_SECONDS - 60), NOW_SECONDS).isCoolingOff).toBe(false)
    })

    it('derives labels for a future timestamp', () => {
        const status = deriveCoolOffStatus(BigInt(NOW_SECONDS + 2 * 24 * 3600), NOW_SECONDS)
        expect(status.isCoolingOff).toBe(true)
        expect(status.endLabel).toBeTruthy()
        expect(status.remainingLabel).toMatch(/^in 2 days$/)
    })
})

describe('<CoolOffStatusBanner>', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(NOW_SECONDS * 1000)
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders nothing when blockedUntil is 0', () => {
        const { container } = render(<CoolOffStatusBanner blockedUntil={0n} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when blockedUntil is in the past', () => {
        const { container } = render(<CoolOffStatusBanner blockedUntil={BigInt(NOW_SECONDS - 3600)} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders the reopen time and relative label for a future blockedUntil', () => {
        const blockedUntil = BigInt(NOW_SECONDS + 3 * 3600)
        const { endLabel } = deriveCoolOffStatus(blockedUntil, NOW_SECONDS)
        render(<CoolOffStatusBanner blockedUntil={blockedUntil} />)

        expect(screen.getByText(new RegExp(`Entries reopen`))).toBeInTheDocument()
        expect(screen.getByText(new RegExp(endLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument()
        expect(screen.getByText(/in 3 hours/)).toBeInTheDocument()
    })
})
