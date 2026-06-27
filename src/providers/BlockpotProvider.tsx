import useLotteryState, { DEFAULT_LOTTERY, LotteryState } from '@/hooks/contracts/lottery/useLotteryState'
import useRoundDraw from '@/hooks/contracts/lottery/useRoundDraw'
import useChainChanged from '@/hooks/web3/useChainChanged'
import { LotteryRound } from '@/types/lottery'
import React, {
    createContext, useContext, useEffect, useState,
} from 'react'
import { usePrevious } from '@/hooks/utilities/usePrevious'
import { useSelectedGame } from './SelectedGameProvider'

type BlockpotContextType = {
    viewRoundIndex?: bigint, 
    setViewRoundIndex?: (roundIndex: bigint | undefined) => void,
    viewRoundOpened: boolean,
    setViewRoundOpened: (opened: boolean) => void,
    lottery: LotteryState
    drawnRound?: LotteryRound,
    drawnRoundOpened: boolean,
    setDrawnRoundOpened: (opened: boolean) => void,
    clearDrawnRound?: () => void,
}

const BlockpotContext = createContext<BlockpotContextType | undefined>(undefined)

type Props = {
  children: React.ReactNode
}

export default function BlockpotProvider({ children }: Props): React.ReactElement {
    const [viewRoundIndex, setViewRoundIndex] = useState<bigint | undefined>()
    const [viewRoundOpened, setViewRoundOpened] = useState(false)
    const lottery = useLotteryState()
    const chainChanged = useChainChanged()
    const { drawnRound, clearDrawnRound, drawnRoundOpened, setDrawnRoundOpened } = useRoundDraw(chainChanged)
    const { selectedGame } = useSelectedGame()
    const previousSelectedGame = usePrevious(selectedGame)

    const blockpotContextValue = {
        lottery: lottery ?? DEFAULT_LOTTERY,
        drawnRound,
        clearDrawnRound,
        drawnRoundOpened,
        setDrawnRoundOpened,
        viewRoundIndex,
        setViewRoundIndex,
        viewRoundOpened,
        setViewRoundOpened
    }

    useEffect(() => {
        if (chainChanged || (!!previousSelectedGame && previousSelectedGame != selectedGame)) {
            setViewRoundIndex(undefined)
        }
    }, [chainChanged, previousSelectedGame, selectedGame])

    return (
        <BlockpotContext.Provider value={blockpotContextValue}>
            {children}
        </BlockpotContext.Provider>
    )
}

const useBlockpot = () => {
    const context = useContext(BlockpotContext)
    if (!context) {
        throw new Error('Blockpot hooks must be used within BlockpotProvider')
    }
    return context
}

export const useLottery = () => {
    return useBlockpot().lottery
}

export const useIsDrawingNumbers = () => {
    return useBlockpot().lottery.isDrawingNumbers
}

export const useLotteryHash = () => {
    return useBlockpot().lottery.lotteryHash
}

export const useViewRoundIndex = () => {
    const { viewRoundIndex, setViewRoundIndex, viewRoundOpened, setViewRoundOpened } = useBlockpot()
    return {
        viewRoundOpened,
        setViewRoundOpened,
        viewRoundIndex,
        setViewRoundIndex,
    }
}