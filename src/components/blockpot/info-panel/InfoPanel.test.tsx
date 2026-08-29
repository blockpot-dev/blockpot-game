import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Address } from 'viem'
import { _InfoPanel } from '.'

vi.mock('@/hooks/utilities/useAccountAddress', () => ({ default: () => undefined }))
vi.mock('@/providers/BlockpotDrawProvider', () => ({ useBlockpotDraw: () => undefined }))

const address = '0x1234567890123456789012345678901234567890' as Address

function renderPanel(isConnected: boolean) {
    return render(
        <_InfoPanel
            isConnected={isConnected}
            purchases={[]}
            setAnimationsEnabled={() => {}}
            animationsEnabled={false}
            setLastPurchaseId={() => {}}
            lastPurchaseId={null}
            accountAddress={address}
        />
    )
}

// BLO-748: your-entries panel uses entry vocabulary, and every empty state
// says what to do next.
describe('InfoPanel', () => {
    it('shows "No entries yet" when connected with no entries', () => {
        const { container } = renderPanel(true)
        expect(screen.getByText('Your Entries')).toBeInTheDocument()
        expect(container.textContent).toMatch(/No entries yet/)
        expect(container.textContent).not.toMatch(/purchas|ticket/i)
    })

    it('asks the player to connect a wallet when disconnected', () => {
        const { container } = renderPanel(false)
        expect(container.textContent).toMatch(/Connect your wallet to enter/)
        expect(container.textContent).not.toMatch(/purchas|ticket/i)
    })
})
