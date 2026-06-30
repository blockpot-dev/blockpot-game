import { createContext, ReactNode, useContext, useState } from 'react'
import Binding from '@/utilities/binding'

export type ModalOpenStateContextType = {
  drawSummaryDialogOpen: Binding<boolean>
  previousRoundsPanelOpen: Binding<boolean>
  prizesOverviewDialogOpen: Binding<boolean>
  fundRoutingDialogOpen: Binding<boolean>
  walletOptionsDialogOpen: Binding<boolean>
  missedDrawDialogOpen: Binding<boolean>
}

const ModalOpenStateContext = createContext<ModalOpenStateContextType | undefined>(undefined)

type Props = {
  children: ReactNode
}

export default function ModalOpenStateProvider({ children }: Props): React.ReactElement {
    const [drawSummaryDialogOpen, setDrawSummaryDialogOpen] = useState(false)
    const [previousRoundsPanelOpen, setPreviousRoundsPanelOpen] = useState(false)
    const [prizesOverviewDialogOpen, setPrizesOverviewDialogOpen] = useState(false)
    const [fundRoutingDialogOpen, setFundRoutingDialogOpen] = useState(false)
    const [walletOptionsDialogOpen, setWalletOptionsDialogOpen] = useState(false)
    const [missedDrawDialogOpen, setMissedDrawDialogOpen] = useState(false)

    const value: ModalOpenStateContextType = {
        drawSummaryDialogOpen: {
            value: drawSummaryDialogOpen,
            update: setDrawSummaryDialogOpen
        },
        previousRoundsPanelOpen: {
            value: previousRoundsPanelOpen,
            update: setPreviousRoundsPanelOpen
        },
        prizesOverviewDialogOpen: {
            value: prizesOverviewDialogOpen,
            update: setPrizesOverviewDialogOpen
        },
        fundRoutingDialogOpen: {
            value: fundRoutingDialogOpen,
            update: setFundRoutingDialogOpen
        },
        walletOptionsDialogOpen: {
            value: walletOptionsDialogOpen,
            update: setWalletOptionsDialogOpen
        },
        missedDrawDialogOpen: {
            value: missedDrawDialogOpen,
            update: setMissedDrawDialogOpen
        }
    }

    return (
        <ModalOpenStateContext.Provider value={value}>
            {children}
        </ModalOpenStateContext.Provider>
    )
}

export const useModalOpenState = () => {
    const context = useContext(ModalOpenStateContext)
    if (!context) {
        throw new Error('Modal open state hooks must be used within ModalOpenStateProvider')
    }
    return context
}

export const useDrawSummaryDialogOpen = () => {
    return useModalOpenState().drawSummaryDialogOpen
}

export const usePreviousRoundsPanelOpen = () => {
    return useModalOpenState().previousRoundsPanelOpen
}

export const usePrizesOverviewDialogOpen = () => {
    return useModalOpenState().prizesOverviewDialogOpen
}

export const useFundRoutingDialogOpen = () => {
    return useModalOpenState().fundRoutingDialogOpen
}

export const useWalletOptionsDialogOpen = () => {
    return useModalOpenState().walletOptionsDialogOpen
}

export const useMissedDrawDialogOpen = () => {
    return useModalOpenState().missedDrawDialogOpen
}
