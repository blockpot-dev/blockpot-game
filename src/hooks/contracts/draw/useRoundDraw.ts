import { useChainId } from 'wagmi'
import { DrawRound } from '@/types/draw'
import { useCallback, useEffect, useState } from 'react'
import { useBlockpotEvents } from '@/providers/BlockpotEventsProvider'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { resolveLgoWinners } from '@/utilities/draw/resolve-lgo-winners'
import useDrawRead from '../read/useDrawRead'
import useLGORead from '../read/useLGORead'
import { calculateMaxRoundsInPot } from './useMaxRoundsInPot'

// Round.status enum on the lottery contract: 0 = OPEN, 1 = DRAWING, 2 = DONE.
// We use the DONE flag (rather than `currentRoundIndex` advancing) as the
// signal that a draw has completed, because nothing in the protocol
// guarantees that index advancement is co-temporal with the draw — it can
// be deferred until a separate keeper / next-round trigger lands. The done
// flag, by contrast, flips inside the same VRF callback that produces the
// drawn numbers, so it is the earliest reliable indicator we can react to.
const ROUND_STATUS_DONE = 2

export default function useRoundDraw(chainChanged: boolean, drawnRoundIndexOverride?: number) {
    const [drawnRoundOpened, setDrawnRoundOpened] = useState(false)
    const chainId = useChainId()
    const [drawnRound, setDrawnRound] = useState<DrawRound | undefined>()
    const [roundIndex, setRoundIndex] = useState<number>(-1)
    // Tracks the most recent round we've already surfaced as a freshly
    // completed draw. `undefined` = not yet observed; -1 = observed live with
    // status not-done (so a future done flip is a real live draw); a non-negative
    // number = the round index whose done state we've already shown.
    // On cold load into an already-DONE round we set this to that round so the
    // user doesn't get a draw animation for something they weren't watching live.
    const [lastSeenDoneRound, setLastSeenDoneRound] = useState<number | undefined>()
    const { game, selectedGame, gameContractName } = useDrawRead()
    const lgo = useLGORead().read

    const { drawRoundBlockNumber } = useBlockpotEvents()

    const loadDrawnRound = useCallback(async (idx: number) => {
        const roundData = await game.getRoundData([idx])
        const maxRoundsInPot = calculateMaxRoundsInPot(await game.currentGameConfig()) ?? 0

        const lotteryAddress = getContractAddress(chainId, gameContractName)
        const lgoAddress = getContractAddress(chainId, ContractName.LGO)
        const draws = await resolveLgoWinners(
            roundData.draws,
            idx,
            lotteryAddress,
            lgoAddress,
            game,
            lgo,
        )

        setDrawnRound({
            roundIndex: idx,
            draws,
            entryCount: roundData.entryCount,
            prizePool: roundData.prizePool,
            drawTime: roundData.drawTime,
            chance: roundData.chance,
            done: roundData.status === ROUND_STATUS_DONE,
            potIndex: roundData.potIndex,
            roundIndexInPot: roundData.roundIndexInPot,
            maxRoundsInPot
        })
    }, [chainId, game, gameContractName, lgo])

    useEffect(() => {
        if (chainChanged) {
            setRoundIndex(-1)
            setLastSeenDoneRound(undefined)
        }
    }, [chainChanged])

    useEffect(() => {
        setRoundIndex(-1)
        setLastSeenDoneRound(undefined)
        setDrawnRound(undefined)
    }, [selectedGame])

    useEffect(() => {
        const loadCurrentRoundId = async () => {
            const roundIndex = await game.currentRoundIndex()
            setRoundIndex(roundIndex)
        }
        loadCurrentRoundId()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawRoundBlockNumber, chainId])

    useEffect(() => {
        const loadCurrentRoundId = async () => {
            const roundIndex = await game.currentRoundIndex()
            setRoundIndex(roundIndex)
        }
        if (roundIndex == -1) {
            loadCurrentRoundId()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGame, roundIndex])

    useEffect(() => {
        if (drawnRoundIndexOverride !== undefined) {
            loadDrawnRound(drawnRoundIndexOverride)
            return
        }
        if (roundIndex === -1) return

        let cancelled = false
        const checkAndLoad = async () => {
            const data = await game.getRoundData([roundIndex])
            if (cancelled) return
            const isDone = data.status === ROUND_STATUS_DONE
            if (lastSeenDoneRound === undefined) {
                // Establish baseline. Suppress an animation for a round that
                // was already done before this session started.
                setLastSeenDoneRound(isDone ? roundIndex : -1)
                return
            }
            if (isDone && lastSeenDoneRound !== roundIndex) {
                await loadDrawnRound(roundIndex)
                if (!cancelled) setLastSeenDoneRound(roundIndex)
            }
        }
        checkAndLoad()
        return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGame, roundIndex, lastSeenDoneRound, drawnRoundIndexOverride, drawRoundBlockNumber])

    return {
        roundIndex,
        drawnRound,
        clearDrawnRound: () => { setDrawnRound(undefined) },
        drawnRoundOpened,
        setDrawnRoundOpened
    }
}
