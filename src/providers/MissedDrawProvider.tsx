import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useSelectedGame } from './SelectedGameProvider'
import { useLottery } from './BlockpotProvider'
import usePlayerEntries from '@/hooks/contracts/lottery/usePlayerEntries'
import useLotteryRound from '@/hooks/contracts/lottery/useLotteryRound'
import { useMissedDrawDialogOpen, useDrawSummaryDialogOpen } from './ModalOpenStateProvider'
import { usePrevious } from '@/hooks/utilities/usePrevious'

type MissedDrawStorage = {
    lastEnteredRound: {
        roundIndex: number
        potIndex: number
        timestamp: number
    } | null
    lastSeenRoundIndex: number | null
}

type MissedDrawContextType = {
    markRoundAsSeen: (roundIndex: number) => void
    missedRoundIndex: number | null
}

const MissedDrawContext = createContext<MissedDrawContextType | undefined>(undefined)

type Props = {
    children: React.ReactNode
}

function getStorageKey(gameType: string, address: string, chainId: number): string {
    return `missedDraw_${gameType}_${address}_${chainId}`
}

function getStorage(gameType: string, address: string | undefined, chainId: number): MissedDrawStorage | null {
    if (!address) return null
    const key = getStorageKey(gameType, address, chainId)
    const stored = localStorage.getItem(key)
    if (!stored) return null
    try {
        return JSON.parse(stored) as MissedDrawStorage
    } catch {
        return null
    }
}

function setStorage(gameType: string, address: string | undefined, chainId: number, data: MissedDrawStorage): void {
    if (!address) return
    const key = getStorageKey(gameType, address, chainId)
    localStorage.setItem(key, JSON.stringify(data))
}

export default function MissedDrawProvider({ children }: Props): React.ReactElement {
    const { address } = useAccount()
    const chainId = useChainId()
    const { selectedGame } = useSelectedGame()
    const lottery = useLottery()
    const currentRound = lottery?.currentRound
    const playerEntries = usePlayerEntries(currentRound?.roundIndex ?? -1)
    const missedDrawDialogOpen = useMissedDrawDialogOpen()
    const drawSummaryDialogOpen = useDrawSummaryDialogOpen()
    const previousSelectedGame = usePrevious(selectedGame)
    const previousAddress = usePrevious(address)
    const previousChainId = usePrevious(chainId)
    const hasCheckedOnMount = useRef<Record<string, boolean>>({})
    const delayedCheckTimeout = useRef<NodeJS.Timeout | null>(null)
    const currentRoundRef = useRef(currentRound)
    const [missedRoundIndex, setMissedRoundIndex] = useState<number | null>(null)
    const missedRound = useLotteryRound(missedRoundIndex ?? -1)
    const previousMissedDrawDialogOpen = usePrevious(missedDrawDialogOpen.value)

    // Keep currentRound ref up to date
    useEffect(() => {
        currentRoundRef.current = currentRound
    }, [currentRound])

    const markRoundAsSeen = (roundIndex: number) => {
        if (!address) return
        const storage = getStorage(selectedGame, address, chainId) ?? {
            lastEnteredRound: null,
            lastSeenRoundIndex: null
        }
        if (storage.lastSeenRoundIndex === null || roundIndex > storage.lastSeenRoundIndex) {
            storage.lastSeenRoundIndex = roundIndex
            // Clear lastEnteredRound if we've seen the draw for that round or a later round
            if (storage.lastEnteredRound && roundIndex >= storage.lastEnteredRound.roundIndex) {
                storage.lastEnteredRound = null
            }
            setStorage(selectedGame, address, chainId, storage)
        }
    }

    // Track when player enters a round
    useEffect(() => {
        if (!address || !currentRound || currentRound.roundIndex < 0) return
        if (playerEntries?.entries && playerEntries.entries.length > 0) {
            const storage = getStorage(selectedGame, address, chainId) ?? {
                lastEnteredRound: null,
                lastSeenRoundIndex: null
            }
            const currentRoundIndex = currentRound.roundIndex
            const currentPotIndex = currentRound.potIndex

            // Only update if this round is newer than stored round
            if (
                storage.lastEnteredRound === null ||
                currentRoundIndex > storage.lastEnteredRound.roundIndex
            ) {
                storage.lastEnteredRound = {
                    roundIndex: currentRoundIndex,
                    potIndex: currentPotIndex,
                    timestamp: Date.now()
                }
                setStorage(selectedGame, address, chainId, storage)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, chainId, selectedGame, currentRound.roundIndex, currentRound.potIndex, playerEntries?.entries])

    // Track when draw summary dialog opens (player saw the draw)
    useEffect(() => {
        if (drawSummaryDialogOpen.value && currentRound && currentRound.roundIndex > 0) {
            // When draw summary opens, the drawn round is typically currentRound - 1
            const drawnRoundIndex = currentRound.roundIndex - 1
            markRoundAsSeen(drawnRoundIndex)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawSummaryDialogOpen.value, currentRound?.roundIndex, selectedGame, address, chainId])

    // Check missed draw conditions when missed round data is available
    useEffect(() => {
        if (!address || !currentRound || currentRound.roundIndex < 0 || !missedRound) return
        const storage = getStorage(selectedGame, address, chainId)
        if (!storage || !storage.lastEnteredRound) return
        const lastEnteredRoundIndex = storage.lastEnteredRound.roundIndex
        const currentRoundIndex = currentRound.roundIndex
        // Check if round was drawn (current round > last entered round)
        if (currentRoundIndex <= lastEnteredRoundIndex) return
        // Check if draw was not seen
        const lastSeenRoundIndex = storage.lastSeenRoundIndex ?? -1
        if (lastSeenRoundIndex >= lastEnteredRoundIndex) return
        // Check if the missed round is done
        if (!missedRound.done) return
        // All conditions met, show dialog
        missedDrawDialogOpen.update(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [missedRound, address, chainId, selectedGame, currentRound.roundIndex, missedDrawDialogOpen.update])

    // Clear missed round index when dialog closes
    useEffect(() => {
        if (!missedDrawDialogOpen.value && previousMissedDrawDialogOpen !== missedDrawDialogOpen.value && missedRoundIndex !== null) {
            setMissedRoundIndex(null)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [missedDrawDialogOpen.value, missedRoundIndex])

    // Reset mount check flag when game changes
    useEffect(() => {
        if (previousSelectedGame && previousSelectedGame !== selectedGame) {
            // Clear the check flag for the new game (using the same key format as the check)
            if (address) {
                const checkKey = `${selectedGame}_${chainId}_${address}`
                delete hasCheckedOnMount.current[checkKey]
            }
            setMissedRoundIndex(null)
            // Clear any pending timeout
            if (delayedCheckTimeout.current) {
                clearTimeout(delayedCheckTimeout.current)
                delayedCheckTimeout.current = null
            }
        }
    }, [selectedGame, previousSelectedGame, address, chainId])

    // Force check when currentRound becomes available after game switch
    useEffect(() => {
        if (!address) return
        if (!currentRound || currentRound.roundIndex < 0) return
        
        const checkKey = `${selectedGame}_${chainId}_${address}`
        // If already checked, don't run again
        // if (hasCheckedOnMount.current[checkKey]) return

        // Clear any existing timeout
        if (delayedCheckTimeout.current) {
            clearTimeout(delayedCheckTimeout.current)
        }

        const currentRoundIndex = currentRound.roundIndex
        // Wait 2-3 seconds before checking (to allow queries to refetch after removal)
        delayedCheckTimeout.current = setTimeout(() => {
            const storage = getStorage(selectedGame, address, chainId)
            if (storage?.lastEnteredRound && currentRoundIndex > storage.lastEnteredRound.roundIndex) {
                const lastSeenRoundIndex = storage.lastSeenRoundIndex ?? -1
                if (lastSeenRoundIndex < storage.lastEnteredRound.roundIndex) {
                    setMissedRoundIndex(storage.lastEnteredRound.roundIndex)
                }
            }
            hasCheckedOnMount.current[checkKey] = true
        }, 2500)

        return () => {
            if (delayedCheckTimeout.current) {
                clearTimeout(delayedCheckTimeout.current)
            }
        }
    }, [selectedGame, previousSelectedGame, address, chainId, currentRound, currentRound?.roundIndex])

    // Check conditions on mount (with delay) or when currentRound becomes available
    useEffect(() => {
        if (!address) return
        if (!currentRound || currentRound.roundIndex < 0) return
        
        const checkKey = `${selectedGame}_${chainId}_${address}`
        if (hasCheckedOnMount.current[checkKey]) {
            return
        }

        // Clear any existing timeout
        if (delayedCheckTimeout.current) {
            clearTimeout(delayedCheckTimeout.current)
        }

        // Wait 2-3 seconds before checking (to allow queries to refetch after removal)
        delayedCheckTimeout.current = setTimeout(() => {
            // Use ref to get latest currentRound value
            const storage = getStorage(selectedGame, address, chainId)
            const currentRoundAtCheck = currentRoundRef.current
            if (storage?.lastEnteredRound && currentRoundAtCheck && currentRoundAtCheck.roundIndex > storage.lastEnteredRound.roundIndex) {
                // Check if draw was not seen
                const lastSeenRoundIndex = storage.lastSeenRoundIndex ?? -1
                if (lastSeenRoundIndex < storage.lastEnteredRound.roundIndex) {
                    setMissedRoundIndex(storage.lastEnteredRound.roundIndex)
                }
            }
            hasCheckedOnMount.current[checkKey] = true
        }, 2500)

        return () => {
            if (delayedCheckTimeout.current) {
                clearTimeout(delayedCheckTimeout.current)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, chainId, selectedGame, currentRound?.roundIndex])

    // Reset when address or chain changes
    useEffect(() => {
        if (
            (previousAddress && previousAddress !== address) ||
            (previousChainId && previousChainId !== chainId)
        ) {
            hasCheckedOnMount.current = {}
            setMissedRoundIndex(null)
            if (delayedCheckTimeout.current) {
                clearTimeout(delayedCheckTimeout.current)
            }
        }
    }, [address, chainId, previousAddress, previousChainId])

    const contextValue: MissedDrawContextType = {
        markRoundAsSeen,
        missedRoundIndex
    }

    return (
        <MissedDrawContext.Provider value={contextValue}>
            {children}
        </MissedDrawContext.Provider>
    )
}

export const useMissedDraw = () => {
    const context = useContext(MissedDrawContext)
    if (!context) {
        throw new Error('useMissedDraw must be used within MissedDrawProvider')
    }
    return context
}
