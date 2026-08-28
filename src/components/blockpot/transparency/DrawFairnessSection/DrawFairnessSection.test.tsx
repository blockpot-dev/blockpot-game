import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { GameType } from '@/providers/SelectedGameProvider'

const search: { round?: number; game?: GameType } = {}
vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router')
    return { ...actual, useSearch: () => search }
})

const setSelectedGame = vi.fn()
vi.mock('@/providers/SelectedGameProvider', async () => {
    const actual = await vi.importActual<typeof import('@/providers/SelectedGameProvider')>('@/providers/SelectedGameProvider')
    return { ...actual, useSelectedGame: () => ({ selectedGame: 'main', gameContractName: 0, setSelectedGame }) }
})

// Independent round counters per game: main is at round 10, quick at round 4.
const LATEST: Record<GameType, number> = { main: 10, quick: 4 }
vi.mock('@/hooks/contracts/draw/useGameLatestRoundIndex', () => ({
    default: (game: GameType) => LATEST[game],
}))

// The proof panel has its own tests; here it only needs to echo what it was asked to show.
vi.mock('../DrawFairnessProof/DrawFairnessProof', () => ({
    default: ({ game, roundIndex }: { game: GameType; roundIndex: number }) => (
        <div data-testid='proof'>{game}:{roundIndex}</div>
    ),
}))

const { default: DrawFairnessSection } = await import('./DrawFairnessSection')

const proof = () => screen.getByTestId('proof').textContent
// RouterProvider mounts its tree asynchronously, so wait for the first paint.
const mount = async () => {
    renderWithProviders(<DrawFairnessSection />)
    await screen.findByTestId('proof')
}
const roundInput = () => screen.getByLabelText('Round') as HTMLInputElement

describe('<DrawFairnessSection>', () => {
    beforeEach(() => {
        delete search.round
        delete search.game
        setSelectedGame.mockClear()
    })

    it('defaults to the latest completed round of the globally selected game', async () => {
        await mount()
        expect(proof()).toBe('main:9')
    })

    it('switching game resets the round to that game\'s latest-1 without touching the global selection', async () => {
        await mount()
        fireEvent.click(screen.getByText('Quick Game'))
        expect(proof()).toBe('quick:3')
        expect(setSelectedGame).not.toHaveBeenCalled()
    })

    it('typing a round and pressing Enter jumps to it', async () => {
        await mount()
        fireEvent.change(roundInput(), { target: { value: '7' } })
        fireEvent.keyDown(roundInput(), { key: 'Enter' })
        expect(proof()).toBe('main:7')
    })

    it('clamps an out-of-range round to the latest', async () => {
        await mount()
        fireEvent.change(roundInput(), { target: { value: '999' } })
        fireEvent.blur(roundInput())
        expect(proof()).toBe('main:10')
        expect(roundInput().value).toBe('10')
    })

    it('reverts non-numeric input', async () => {
        await mount()
        fireEvent.change(roundInput(), { target: { value: 'abc' } })
        fireEvent.blur(roundInput())
        expect(proof()).toBe('main:9')
        expect(roundInput().value).toBe('9')
    })

    it('Latest jumps to the latest round', async () => {
        await mount()
        fireEvent.click(screen.getByRole('button', { name: 'Latest' }))
        expect(proof()).toBe('main:10')
    })

    it('initialises both game and round from ?game=quick&round=3', async () => {
        search.game = 'quick'
        search.round = 3
        await mount()
        expect(proof()).toBe('quick:3')
    })

    it('ignores ?round= when it belongs to a different game than the one shown', async () => {
        search.game = 'quick'
        search.round = 3
        await mount()
        fireEvent.click(screen.getByText('Main Game'))
        expect(proof()).toBe('main:9')
    })
})
