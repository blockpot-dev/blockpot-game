import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { _FundRoutingDialog } from './FundRoutingDialog'
import type { FiatConverter } from '@/hooks/utilities/useFiatConverter'
import { PEA_PER_ENTRY_WEI } from '@/constants/protocol'
import { DEFAULT_GAME_CONFIG, GameConfig } from '@/types/lottery/config'

// _FundRoutingDialog takes plain props, so it renders without the wagmi / Web3
// stack. Fiat conversion is stubbed to a deterministic formatter.
const fiatConverter: FiatConverter = (value: bigint) => ({
    value: 0n,
    formattedValue: value === 0n ? '$0' : '$1',
})

const mainGameConfig: GameConfig = {
    ...DEFAULT_GAME_CONFIG,
    prizeTierAllocations: [9000, 900, 100],
    nextPotAllocation: 1000,
    parentGamePotAllocation: 0,
}

const quickGameConfig: GameConfig = {
    ...DEFAULT_GAME_CONFIG,
    prizeTierAllocations: [8000, 1000, 600, 300, 100],
    nextPotAllocation: 0,
    parentGamePotAllocation: 2000,
}

describe('<FundRoutingDialog>', () => {
    it('shows each current-game tier and the next-pot reserve for the main game (no parent row)', async () => {
        renderWithProviders(
            <_FundRoutingDialog
                open
                onClose={vi.fn()}
                pea={PEA_PER_ENTRY_WEI}
                gameConfig={mainGameConfig}
                selectedGame='main'
                fiatConverter={fiatConverter}
            />,
        )

        expect(await screen.findByText('Jackpot')).toBeInTheDocument()
        expect(screen.getByText('2nd')).toBeInTheDocument()
        expect(screen.getByText('3rd')).toBeInTheDocument()
        expect(screen.getByText('Next-pot reserve')).toBeInTheDocument()
        expect(screen.queryByText('Main game')).not.toBeInTheDocument()
    })

    it('shows a parent (Main game) row and no next-pot reserve for the quick game', async () => {
        renderWithProviders(
            <_FundRoutingDialog
                open
                onClose={vi.fn()}
                pea={PEA_PER_ENTRY_WEI}
                gameConfig={quickGameConfig}
                selectedGame='quick'
                fiatConverter={fiatConverter}
            />,
        )

        expect(await screen.findByText('Main game')).toBeInTheDocument()
        expect(screen.getByText('5th')).toBeInTheDocument()
        expect(screen.queryByText('Next-pot reserve')).not.toBeInTheDocument()
    })
})
