import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ZERO_ADDRESS } from '@/web3/constants'

const listState: { items: unknown[], hasMore: boolean, isInitialLoading: boolean, loadMore: () => void } = {
    items: [],
    hasMore: false,
    isInitialLoading: false,
    loadMore: vi.fn()
}
vi.mock('@/hooks/contracts/draw/usePreviousRoundsList', () => ({
    default: () => listState
}))
vi.mock('@/providers/BlockpotDrawProvider', () => ({
    useBlockpotDraw: () => ({ viewRoundSummary: vi.fn() })
}))

const { default: PreviousRounds } = await import('.')

function renderOpen() {
    return render(<PreviousRounds accountAddress={ZERO_ADDRESS} isOpen={{ value: true, update: vi.fn() }} />)
}

describe('<PreviousRounds>', () => {
    it('renders "No draws yet" when the list is empty', () => {
        listState.items = []
        listState.isInitialLoading = false
        renderOpen()
        expect(screen.getByText('No draws yet for this filter.')).toBeInTheDocument()
    })

    it('renders loading copy while the latest round index is fetched', () => {
        listState.items = []
        listState.isInitialLoading = true
        renderOpen()
        expect(screen.getByText('Loading draws…')).toBeInTheDocument()
        listState.isInitialLoading = false
    })
})
