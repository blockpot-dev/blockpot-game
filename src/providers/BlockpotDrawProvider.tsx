import React, {
    createContext, memo, useContext, useEffect, useRef, useState, useMemo, useCallback,
} from 'react'
import { useIsDrawingNumbers } from './BlockpotProvider'
import useRoundDraw from '@/hooks/contracts/lottery/useRoundDraw'
import useChainChanged from '@/hooks/web3/useChainChanged'
import { LotteryEntry, LotteryRound } from '@/types/lottery'
import useFiatConverter from '@/hooks/utilities/useFiatConverter'
import { useAccount } from 'wagmi'
import useNativeCurrency from '@/hooks/web3/useNativeCurrency'
import { ZERO_ADDRESS } from '@/web3/constants'
import { DisplayDrawnNumberData } from '@/types/lottery/display-drawn-number-data'
import { createDisplayDrawnNumberData } from '@/utilities/lottery/display-drawn-number-data'
import DrawSummaryDialog from '@/components/blockpot/modals/DrawSummaryDialog/DrawSummaryDialog'
import usePlayerEntries from '@/hooks/contracts/lottery/usePlayerEntries'
import { useDrawSummaryDialogOpen, usePreviousRoundsPanelOpen } from './ModalOpenStateProvider'
import { useMissedDraw } from './MissedDrawProvider'
import { GameType, useSelectedGame } from './SelectedGameProvider'
import { usePrevious } from '@/hooks/utilities/usePrevious'

export type LotteryDrawContext = {
    roundIndex: number
    drawStage: LotteryDrawStage
}

export type StagedDraw = {
    drawnNumbers: DisplayDrawnNumberData[]
}

type LotteryDrawWaitingStage = { type: 'waiting', roundIndex: number }
type LotteryDrawDrawingStage = { type: 'drawing', drawnRound: LotteryRound, stagedDraw: StagedDraw, playerEntries: LotteryEntry[] }
type LotteryDrawCompleteStage = { type: 'complete', drawnRound: LotteryRound, stagedDraw: StagedDraw, playerEntries: LotteryEntry[] }
export type LotteryDrawStage = LotteryDrawWaitingStage | LotteryDrawDrawingStage | LotteryDrawCompleteStage

type BlockpotDrawContextType = {
    draw: LotteryDrawContext | undefined
    clearDraw: () => void
    setDraw: (draw: LotteryDrawContext | undefined) => void
    drawnRound: LotteryRound | undefined
    viewRoundSummary: (round: LotteryRound, gameType?: GameType) => void
    replayDraw: (roundIndex: number) => void
    advanceDraw: () => void
}

const BlockpotDrawContext = createContext<BlockpotDrawContextType | undefined>(undefined)

type Props = {
    children: React.ReactNode
}

function BlockpotDrawProvider({ children }: Props): React.ReactElement {
    const chainChanged = useChainChanged()
    const { address } = useAccount()
    const nativeToken = useNativeCurrency()
    const fiatConverter = useFiatConverter()
    const isDrawingNumbers = useIsDrawingNumbers()
    const [drawnRoundIndexOverride, setDrawnRoundIndexOverride] = useState<number | undefined>()
    const { roundIndex: roundDrawRoundIndex, drawnRound, clearDrawnRound } = useRoundDraw(chainChanged, drawnRoundIndexOverride)
    const [drawnRoundSummary, setDrawnRoundSummary] = useState<LotteryRound | undefined>()
    const [drawnRoundSummaryGameType, setDrawnRoundSummaryGameType] = useState<GameType | undefined>()
    const { selectedGame } = useSelectedGame()
    const previousSelectedGame = usePrevious(selectedGame)
    const playerEntries = usePlayerEntries(drawnRound?.roundIndex ?? -1)
    const [draw, setDraw] = useState<LotteryDrawContext | undefined>()
    const drawSummaryDialogOpen = useDrawSummaryDialogOpen()
    const previousRoundsPanelOpen = usePreviousRoundsPanelOpen()
    const { markRoundAsSeen } = useMissedDraw()

    const displayDrawnNumberData = useMemo(() => {
        if (!drawnRound) return []
        return createDisplayDrawnNumberData(
            [...drawnRound.draws],
            address ?? ZERO_ADDRESS,
            nativeToken,
            fiatConverter
        )
    }, [drawnRound, address, nativeToken, fiatConverter])

    const roundIndex = drawnRound?.roundIndex ?? roundDrawRoundIndex

    const advanceDraw = useCallback(() => {
        if (!draw || draw.drawStage.type !== 'drawing') { return }
        const draws = draw.drawStage.drawnRound.draws

        const currentDrawnNumbersLength = draw.drawStage.stagedDraw.drawnNumbers.length
        if (currentDrawnNumbersLength >= draws.length) {
            setDraw((draw: LotteryDrawContext | undefined) => {
                if (!draw || draw.drawStage.type !== 'drawing') { return draw }
                const drawCopy = { ...draw }
                drawCopy.drawStage.type = 'complete'
                return drawCopy
            })
            drawSummaryDialogOpen.update(true)
        } else {
            setDraw((draw: LotteryDrawContext | undefined) => {
                if (!draw || draw.drawStage.type !== 'drawing') { return draw }
                return {
                    roundIndex,
                    drawStage: {
                        type: 'drawing',
                        drawnRound: draw.drawStage.drawnRound,
                        stagedDraw: {
                            drawnNumbers: displayDrawnNumberData.slice(0, currentDrawnNumbersLength + 1)
                        },
                        playerEntries: playerEntries?.entries ?? []
                    }
                }
            })
        }
    }, [draw, roundIndex, displayDrawnNumberData, playerEntries?.entries, drawSummaryDialogOpen])

    const clearDraw = () => {
        setDraw(undefined)
        clearDrawnRound()
    }

    useEffect(() => {
        if (!!previousSelectedGame && previousSelectedGame !== selectedGame) {
            setDraw(undefined)
            setDrawnRoundIndexOverride(undefined)
            setDrawnRoundSummary(undefined)
            setDrawnRoundSummaryGameType(undefined)
            drawSummaryDialogOpen.update(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGame, previousSelectedGame])

    // Background-tab recovery: while the tab is hidden, the per-ticket animationend
    // -> setTimeout(advanceDraw) chain can be throttled, lose its DOM target, or be
    // suspended entirely by Chromium. When the tab returns visible, fast-forward any
    // mid-flight draw straight to 'complete' — the user already missed the animation.
    const recoveryStateRef = useRef({
        draw,
        drawnRound,
        displayDrawnNumberData,
        playerEntries: playerEntries?.entries ?? [],
        roundIndex,
    })
    recoveryStateRef.current = {
        draw,
        drawnRound,
        displayDrawnNumberData,
        playerEntries: playerEntries?.entries ?? [],
        roundIndex,
    }

    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState !== 'visible') return
            const snapshot = recoveryStateRef.current
            const currentDraw = snapshot.draw
            if (!currentDraw || currentDraw.drawStage.type !== 'drawing') return
            const totalDraws = currentDraw.drawStage.drawnRound.draws.length
            if (snapshot.displayDrawnNumberData.length < totalDraws) return
            if (currentDraw.drawStage.stagedDraw.drawnNumbers.length >= totalDraws) return
            setDraw({
                roundIndex: snapshot.roundIndex,
                drawStage: {
                    type: 'complete',
                    drawnRound: currentDraw.drawStage.drawnRound,
                    stagedDraw: { drawnNumbers: snapshot.displayDrawnNumberData },
                    playerEntries: snapshot.playerEntries,
                },
            })
            drawSummaryDialogOpen.update(true)
        }
        document.addEventListener('visibilitychange', onVisibilityChange)
        return () => document.removeEventListener('visibilitychange', onVisibilityChange)
    }, [drawSummaryDialogOpen])

    useEffect(() => {
        if ((isDrawingNumbers || drawnRound) && !draw) {
            setDraw({
                roundIndex,
                drawStage: { type: 'waiting', roundIndex }
            })
            // Mark round as seen when watching live draw
            markRoundAsSeen(roundIndex)
        } else if (draw && draw.drawStage.type === 'waiting' && drawnRound) {
            const cancel = setTimeout(() => {
                setDraw({
                    roundIndex,
                    drawStage: {
                        type: 'drawing',
                        drawnRound,
                        stagedDraw: {
                            drawnNumbers: displayDrawnNumberData.slice(0, 1)
                        },
                        playerEntries: playerEntries?.entries ?? []
                    }
                })
            }, 3000)
            return () => clearTimeout(cancel)
        }
    }, [isDrawingNumbers, draw, roundIndex, drawnRound, displayDrawnNumberData, playerEntries?.entries, markRoundAsSeen])

    const viewRoundSummary = (round: LotteryRound, gameType?: GameType) => {
        setDrawnRoundSummary(round)
        setDrawnRoundSummaryGameType(gameType ?? selectedGame)
        drawSummaryDialogOpen.update(true)
    }

    const replayDraw = (roundIndex: number) => {
        setDrawnRoundIndexOverride(roundIndex)
        drawSummaryDialogOpen.update(false)
        previousRoundsPanelOpen.update(false)
    }

    const blockpotDrawContextValue: BlockpotDrawContextType = {
        draw,
        clearDraw,
        setDraw,
        drawnRound,
        viewRoundSummary,
        replayDraw,
        advanceDraw
    }

    const liveDrawRoundIndex = (draw?.drawStage.type === 'drawing' || draw?.drawStage.type === 'complete')
        ? draw.drawStage.drawnRound.roundIndex
        : undefined
    const roundIndexToView = drawnRoundSummary?.roundIndex ?? liveDrawRoundIndex ?? drawnRound?.roundIndex

    return (
        <BlockpotDrawContext.Provider value={blockpotDrawContextValue}>
            {children}
            {
                (roundIndexToView !== undefined && roundIndexToView !== null) && (
                    <DrawSummaryDialog
                        open={drawSummaryDialogOpen.value}
                        onClose={() => {
                            setDrawnRoundIndexOverride(undefined)
                            setDrawnRoundSummaryGameType(undefined)
                            drawSummaryDialogOpen.update(false)
                            clearDraw()
                        }}
                        roundIndex={roundIndexToView ?? -1}
                        gameType={drawnRoundSummaryGameType ?? selectedGame}
                        onReplayDraw={(roundIndex) => {
                            setDrawnRoundIndexOverride(roundIndex)
                            drawSummaryDialogOpen.update(false)
                            previousRoundsPanelOpen.update(false)
                        }}
                    />
                )
            }
        </BlockpotDrawContext.Provider>
    )
}

export const useLotteryDraw = () => {
    const context = useContext(BlockpotDrawContext)
    if (context === undefined) {
        throw new Error('useLotteryDraw must be used within a BlockpotDrawProvider')
    }
    return context
}

export default memo(BlockpotDrawProvider)
