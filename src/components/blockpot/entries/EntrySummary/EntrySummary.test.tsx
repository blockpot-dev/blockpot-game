import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import EntrySummary from './EntrySummary'
import { Amounts } from '@/types/draw/tokens'
import { DEFAULT_GAME_CONFIG, GameConfig } from '@/types/draw/config'

// The "Prize pool" row must open the fund-routing dialog. We mock the open
// binding at the boundary (repo convention) and stub the dialog itself — its
// rendering is covered by FundRoutingDialog.test.tsx and pulling it in here
// would drag the wagmi-backed useFiatConverter into the test.
const fundRoutingUpdateMock = vi.fn()
vi.mock('@/providers/ModalOpenStateProvider', () => ({
    useFundRoutingDialogOpen: () => ({ value: false, update: fundRoutingUpdateMock }),
}))
vi.mock('../../modals/FundRoutingDialog/FundRoutingDialog', () => ({
    default: () => null,
}))

function amounts(formatted: string): Amounts {
    return { amount: 1n, amountFormatted: formatted, fiat: 0n, fiatFormatted: '$0', nativeToken: 'ETH' }
}

const gameConfig: GameConfig = {
    ...DEFAULT_GAME_CONFIG,
    prizeTierAllocations: [9000, 900, 100],
    nextPotAllocation: 1000,
    parentGamePotAllocation: 0,
}

function renderSummary() {
    return render(
        <EntrySummary
            pea={amounts('0.001')}
            cf={amounts('0.00002')}
            of={amounts('0.00005')}
            total={amounts('0.00107')}
            baseBalance='1.0'
            cfBasisPoints={200n}
            ofBasisPoints={500n}
            basisPointsDivisor={10_000n}
            gameConfig={gameConfig}
            selectedGame='main'
        />,
    )
}

describe('<EntrySummary>', () => {
    it('opens the fund-routing dialog when the Prize pool row is clicked', () => {
        renderSummary()

        fireEvent.click(screen.getByText('Show breakdown'))
        fireEvent.click(screen.getByText('Prize pool'))

        expect(fundRoutingUpdateMock).toHaveBeenCalledWith(true)
    })
})
