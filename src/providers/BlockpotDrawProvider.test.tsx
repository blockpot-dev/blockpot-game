import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import BlockpotDrawProvider, { useLotteryDraw } from './BlockpotDrawProvider'
import { ContractName } from '@/constants/contract-addresses'
import type { LotteryRound } from '@/types/lottery'
import { ZERO_ADDRESS } from '@/web3/constants'

const mocks = vi.hoisted(() => ({
    useSelectedGameMock: vi.fn(),
    useIsDrawingNumbersMock: vi.fn(),
    useRoundDrawMock: vi.fn(),
    markRoundAsSeenMock: vi.fn(),
    drawSummaryDialogOpenBinding: { value: false, update: vi.fn() },
    previousRoundsPanelOpenBinding: { value: false, update: vi.fn() },
    drawSummaryDialogSpy: vi.fn(),
}))

vi.mock('wagmi', () => ({
    useAccount: () => ({ address: undefined }),
}))

vi.mock('./SelectedGameProvider', () => ({
    useSelectedGame: () => mocks.useSelectedGameMock(),
}))

vi.mock('./BlockpotProvider', () => ({
    useIsDrawingNumbers: () => mocks.useIsDrawingNumbersMock(),
}))

vi.mock('@/hooks/contracts/lottery/useRoundDraw', () => ({
    default: () => mocks.useRoundDrawMock(),
}))

vi.mock('@/hooks/contracts/lottery/usePlayerEntries', () => ({
    default: () => ({ entries: [] }),
}))

vi.mock('@/hooks/utilities/useFiatConverter', () => ({
    default: () => () => ({ value: 0n, formattedValue: '$0.00' }),
}))

vi.mock('@/hooks/web3/useNativeCurrency', () => ({
    default: () => 'ETH',
}))

vi.mock('@/hooks/web3/useChainChanged', () => ({
    default: () => false,
}))

vi.mock('./MissedDrawProvider', () => ({
    useMissedDraw: () => ({ markRoundAsSeen: mocks.markRoundAsSeenMock, missedRoundIndex: null }),
}))

vi.mock('./ModalOpenStateProvider', () => ({
    useDrawSummaryDialogOpen: () => mocks.drawSummaryDialogOpenBinding,
    usePreviousRoundsPanelOpen: () => mocks.previousRoundsPanelOpenBinding,
}))

vi.mock('@/components/blockpot/modals/DrawSummaryDialog/DrawSummaryDialog', () => ({
    default: (props: { roundIndex: number }) => {
        mocks.drawSummaryDialogSpy(props)
        return null
    },
}))

const mainRound: LotteryRound = {
    roundIndex: 5,
    draws: [],
    prizePool: 0n,
    drawTime: 0,
    entryCount: 0,
    potIndex: 0,
    roundIndexInPot: 0,
    chance: 10000,
    done: false,
    maxRoundsInPot: 10,
}

function wrapper({ children }: { children: React.ReactNode }) {
    return <BlockpotDrawProvider>{children}</BlockpotDrawProvider>
}

describe('<BlockpotDrawProvider> draw state on game switch', () => {
    beforeEach(() => {
        mocks.markRoundAsSeenMock.mockClear()
        mocks.drawSummaryDialogOpenBinding.update.mockClear()
        mocks.useSelectedGameMock.mockReturnValue({
            selectedGame: 'main',
            gameContractName: ContractName.LOTTERY_MAIN,
            setSelectedGame: vi.fn(),
        })
        mocks.useIsDrawingNumbersMock.mockReturnValue(true)
        mocks.useRoundDrawMock.mockReturnValue({
            roundIndex: 5,
            drawnRound: mainRound,
            clearDrawnRound: vi.fn(),
            drawnRoundOpened: false,
            setDrawnRoundOpened: vi.fn(),
        })
    })

    it('switching selectedGame resets draw to undefined', () => {
        const { result, rerender } = renderHook(() => useLotteryDraw(), { wrapper })
        expect(result.current.draw).toBeDefined()

        mocks.useSelectedGameMock.mockReturnValue({
            selectedGame: 'quick',
            gameContractName: ContractName.QUICK_GAME,
            setSelectedGame: vi.fn(),
        })
        mocks.useIsDrawingNumbersMock.mockReturnValue(false)
        mocks.useRoundDrawMock.mockReturnValue({
            roundIndex: -1,
            drawnRound: undefined,
            clearDrawnRound: vi.fn(),
            drawnRoundOpened: false,
            setDrawnRoundOpened: vi.fn(),
        })

        rerender()

        expect(result.current.draw).toBeUndefined()
    })

    it('rerender with unchanged selectedGame preserves draw', () => {
        const { result, rerender } = renderHook(() => useLotteryDraw(), { wrapper })
        expect(result.current.draw).toBeDefined()
        const drawAfterMount = result.current.draw

        rerender()

        expect(result.current.draw).toBeDefined()
        expect(result.current.draw).toEqual(drawAfterMount)
    })
})

describe('<BlockpotDrawProvider> DrawSummaryDialog round binding under live-draw race', () => {
    const roundN: LotteryRound = {
        roundIndex: 5,
        draws: [{ winner: ZERO_ADDRESS, number: 42, prize: 0n }],
        prizePool: 0n,
        drawTime: 0,
        entryCount: 0,
        potIndex: 0,
        roundIndexInPot: 0,
        chance: 10000,
        done: true,
        maxRoundsInPot: 10,
    }

    const roundNPlusOne: LotteryRound = {
        ...roundN,
        roundIndex: 6,
        draws: [{ winner: ZERO_ADDRESS, number: 99, prize: 0n }],
    }

    beforeEach(() => {
        vi.useFakeTimers()
        mocks.drawSummaryDialogSpy.mockClear()
        mocks.markRoundAsSeenMock.mockClear()
        mocks.drawSummaryDialogOpenBinding.update.mockClear()
        mocks.drawSummaryDialogOpenBinding.value = false
        mocks.useSelectedGameMock.mockReturnValue({
            selectedGame: 'quick',
            gameContractName: ContractName.QUICK_GAME,
            setSelectedGame: vi.fn(),
        })
        mocks.useIsDrawingNumbersMock.mockReturnValue(true)
        mocks.useRoundDrawMock.mockReturnValue({
            roundIndex: roundN.roundIndex,
            drawnRound: roundN,
            clearDrawnRound: vi.fn(),
            drawnRoundOpened: false,
            setDrawnRoundOpened: vi.fn(),
        })
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('binds DrawSummaryDialog to the animated round when a newer round completes mid-animation', () => {
        const { result, rerender } = renderHook(() => useLotteryDraw(), { wrapper })

        // Initial mount sets the waiting stage; advance past the 3s timeout to enter drawing.
        act(() => {
            vi.advanceTimersByTime(3000)
        })
        expect(result.current.draw?.drawStage.type).toBe('drawing')

        // Drive the animation to completion. The single draw means one advanceDraw flips to complete.
        act(() => {
            result.current.advanceDraw()
        })
        expect(result.current.draw?.drawStage.type).toBe('complete')

        // Simulate a fresh Quick Game round reaching DONE while the dialog is still open:
        // useRoundDraw's live cursor advances to N+1, and the dialog open binding is now true.
        mocks.useRoundDrawMock.mockReturnValue({
            roundIndex: roundNPlusOne.roundIndex,
            drawnRound: roundNPlusOne,
            clearDrawnRound: vi.fn(),
            drawnRoundOpened: false,
            setDrawnRoundOpened: vi.fn(),
        })
        mocks.drawSummaryDialogOpenBinding.value = true

        rerender()

        const lastCall = mocks.drawSummaryDialogSpy.mock.calls.at(-1)
        expect(lastCall).toBeDefined()
        expect(lastCall![0].roundIndex).toBe(roundN.roundIndex)
    })
})

describe('<BlockpotDrawProvider> visibility-aware draw recovery', () => {
    const multiDrawRound: LotteryRound = {
        roundIndex: 7,
        draws: [
            { winner: ZERO_ADDRESS, number: 11, prize: 0n },
            { winner: ZERO_ADDRESS, number: 22, prize: 0n },
            { winner: ZERO_ADDRESS, number: 33, prize: 0n },
        ],
        prizePool: 0n,
        drawTime: 0,
        entryCount: 0,
        potIndex: 0,
        roundIndexInPot: 0,
        chance: 10000,
        done: true,
        maxRoundsInPot: 10,
    }

    function setVisibility(state: 'visible' | 'hidden') {
        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            get: () => state,
        })
        Object.defineProperty(document, 'hidden', {
            configurable: true,
            get: () => state === 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))
    }

    beforeEach(() => {
        vi.useFakeTimers()
        mocks.drawSummaryDialogSpy.mockClear()
        mocks.markRoundAsSeenMock.mockClear()
        mocks.drawSummaryDialogOpenBinding.update.mockClear()
        mocks.drawSummaryDialogOpenBinding.value = false
        mocks.useSelectedGameMock.mockReturnValue({
            selectedGame: 'quick',
            gameContractName: ContractName.QUICK_GAME,
            setSelectedGame: vi.fn(),
        })
        mocks.useIsDrawingNumbersMock.mockReturnValue(true)
        mocks.useRoundDrawMock.mockReturnValue({
            roundIndex: multiDrawRound.roundIndex,
            drawnRound: multiDrawRound,
            clearDrawnRound: vi.fn(),
            drawnRoundOpened: false,
            setDrawnRoundOpened: vi.fn(),
        })
        setVisibility('visible')
    })

    afterEach(() => {
        vi.useRealTimers()
        setVisibility('visible')
    })

    it('fast-forwards a stuck drawing-stage draw to complete when the tab returns to visible', () => {
        const { result } = renderHook(() => useLotteryDraw(), { wrapper })

        // Enter the drawing stage by letting the waiting->drawing 3s timer fire.
        act(() => {
            vi.advanceTimersByTime(3000)
        })
        const drawingStage = result.current.draw?.drawStage
        expect(drawingStage?.type).toBe('drawing')
        if (drawingStage?.type !== 'drawing') return
        expect(drawingStage.stagedDraw.drawnNumbers.length).toBe(1)
        expect(drawingStage.drawnRound.draws.length).toBe(3)

        // Hide the tab. While hidden, no advanceDraw runs (the real bug: animationend
        // listener never fires or setTimeout never resumes). Advance time generously
        // past the natural ~2.9s advance window to mimic real background throttling.
        act(() => {
            setVisibility('hidden')
            vi.advanceTimersByTime(10_000)
        })
        expect(result.current.draw?.drawStage.type).toBe('drawing')

        // Bring the tab back. The provider must notice and fast-forward to complete.
        act(() => {
            setVisibility('visible')
        })

        const recoveredStage = result.current.draw?.drawStage
        expect(recoveredStage?.type).toBe('complete')
        if (recoveredStage?.type !== 'complete') return
        expect(recoveredStage.stagedDraw.drawnNumbers.length).toBe(
            multiDrawRound.draws.length
        )
        expect(mocks.drawSummaryDialogOpenBinding.update).toHaveBeenCalledWith(true)
    })
})
