import { ContractName } from '@/constants/contract-addresses'
import React, {
    createContext, useContext, useState,
} from 'react'

export type GameType = 'main' | 'quick'

type SelectedGameContextType = {
    selectedGame: GameType,
    gameContractName: ContractName,
    setSelectedGame: (gameType: GameType) => void
}

const SelectedGameContext = createContext<SelectedGameContextType | undefined>(undefined)

type Props = {
  children: React.ReactNode
}

export function SelectedGameProvider({ children }: Props): React.ReactElement {
    const [selectedGame, setSelectedGame] = useState<GameType>('main')
    const gameContractName = selectedGame == 'main' ? ContractName.DRAW_MAIN : ContractName.QUICK_GAME

    const selectedGameContextValue = {
        setSelectedGame,
        gameContractName,
        selectedGame
    }

    return (
        <SelectedGameContext.Provider value={selectedGameContextValue}>
            {children}
        </SelectedGameContext.Provider>
    )
}

export const useSelectedGame = () => {
    const context = useContext(SelectedGameContext)
    if (!context) {
        throw new Error('Selected game hooks must be used within SelectedGameProvider')
    }
    return context
}