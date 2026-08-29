import { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { Address, isAddressEqual } from 'viem'
import { _DrawSummaryDialog, DrawSummaryLoadingDialog, type _DrawSummaryDialogProps } from './DrawSummaryDialog'
import { DrawEntry } from '@/types/draw'
import { resolvePlayerEntries } from '@/utilities/draw/resolve-player-entries'

const Template = (props: _DrawSummaryDialogProps) => {
    return (
        <_DrawSummaryDialog {...props} />
    )
}



const meta: Meta<typeof _DrawSummaryDialog> = {
    component: _DrawSummaryDialog,
    args: {
        open: true,
        onClose: () => { },
        gameType: 'main',
        proofRoundIndex: 7
    },
    argTypes: {}
}

export default meta

type Story = StoryObj<typeof _DrawSummaryDialog>

// Regression scenario for task 52: in v2 the on-chain beneficiary is the operator contract,
// so entriesForBeneficiary(round, connectedWallet) returns []. The fix routes the lookup
// through resolvePlayerEntries which queries entriesForBeneficiary(round, OPERATOR_ADDRESS),
// then maps each entry to its real owner via operator.entryOwnerOf, then filters by the
// connected wallet. Pre-fix this story renders Total Tickets: 0; post-fix it renders one
// row with from=100, to=104 and Total Tickets: 5.
const REGRESSION_ROUND = 7
const REGRESSION_DRAW = '0x0000000000000000000000000000000000000A11' as Address
const REGRESSION_OPERATOR = '0x0000000000000000000000000000000000000B22' as Address
const REGRESSION_PLAYER = '0x0000000000000000000000000000000000000C33' as Address
const REGRESSION_ENTRY_INDEX = 42

const regressionGame = {
    entriesForBeneficiary: async ([round, beneficiary]: readonly [number, Address]) => {
        if (round === REGRESSION_ROUND && isAddressEqual(beneficiary, REGRESSION_OPERATOR)) {
            return [REGRESSION_ENTRY_INDEX]
        }
        return []
    },
    getEntry: async ([entryIndex, round]: readonly [number, number]) => {
        if (entryIndex === REGRESSION_ENTRY_INDEX && round === REGRESSION_ROUND) {
            return {
                beneficiary: REGRESSION_OPERATOR,
                entryStart: 100,
                amount: 5,
                payoutInWeth: false,
            }
        }
        throw new Error(`unexpected getEntry call: entryIndex=${entryIndex}, round=${round}`)
    },
} as unknown as Parameters<typeof resolvePlayerEntries>[4]

const regressionOperator = {
    entryOwnerOf: async ([draw, round, entryIndex]: readonly [Address, number, number]) => {
        if (
            isAddressEqual(draw, REGRESSION_DRAW)
            && round === REGRESSION_ROUND
            && entryIndex === REGRESSION_ENTRY_INDEX
        ) {
            return [REGRESSION_PLAYER, false, true] as const
        }
        throw new Error('unexpected entryOwnerOf call')
    },
} as unknown as Parameters<typeof resolvePlayerEntries>[5]

function PlayerEntriesResolvedFromOperatorOwnershipRender(props: _DrawSummaryDialogProps) {
    const [purchases, setPurchases] = useState<DrawEntry[]>([])
    useEffect(() => {
        let cancelled = false
        resolvePlayerEntries(
            REGRESSION_ROUND,
            REGRESSION_PLAYER,
            REGRESSION_DRAW,
            REGRESSION_OPERATOR,
            regressionGame,
            regressionOperator,
        ).then((entries) => {
            if (!cancelled) setPurchases(entries)
        })
        return () => { cancelled = true }
    }, [])
    return <Template {...props} purchases={purchases} />
}

export const PlayerEntriesResolvedFromOperatorOwnership: Story = {
    render: (props: _DrawSummaryDialogProps) => <PlayerEntriesResolvedFromOperatorOwnershipRender
        {...props}
        displayDrawnNumberData={[]}
        roundId={{
            potIndex: 1,
            roundIndex: REGRESSION_ROUND,
            maxRoundsPerPot: 10,
        }}
        formattedChance={'10.00%'}
        formattedDate={''}
        purchases={[]}
        onReplayDraw={() => {}}
    />,
}

export const Basic: Story = {
    render: (props: _DrawSummaryDialogProps) => <Template
        {...props}
        displayDrawnNumberData={[
            {
                isPlayerWinner: true,
                number: 1241,
                ordinal: 1,
                prize: {
                    fiatFormatted: '$100',
                    fiat: 100n,
                    amount: 100n,
                    amountFormatted: '100',
                    nativeToken: 'ETH'
                },
                winner: '0x1234567890123456789012345678901234567890'
            },
            {
                isPlayerWinner: false,
                number: 32452,
                ordinal: 2,
                prize: {
                    fiatFormatted: '$100',
                    fiat: 100n,
                    amount: 100n,
                    amountFormatted: '100',
                    nativeToken: 'ETH'
                },
                winner: '0x1234567890123456789012345678901234567890'
            },
            {
                isPlayerWinner: false,
                number: 4563,
                ordinal: 3,
                prize: {
                    fiatFormatted: '$100',
                    fiat: 100n,
                    amount: 100n,
                    amountFormatted: '100',
                    nativeToken: 'ETH'
                },
                winner: '0x1234567890123456789012345678901234567890'
            }
        ]}
        roundId={{
            potIndex: 1,
            roundIndex: 1,
            maxRoundsPerPot: 10
        }}
        formattedChance={'10.00%'}
        purchases={[
            {
                index: 1,
                beneficiary: '0x1234567890123456789012345678901234567890',
                entryStart: 1,
                amount: 5,
                payoutInWeth: false
            },
            {
                index: 5,
                beneficiary: '0x1234567890123456789012345678901234567890',
                entryStart: 100,
                amount: 500,
                payoutInWeth: false
            },
            {
                index: 9,
                beneficiary: '0x1234567890123456789012345678901234567890',
                entryStart: 879,
                amount: 1,
                payoutInWeth: false
            },

        ]}
    />,

}

export const QuickGame: Story = {
    render: (props: _DrawSummaryDialogProps) => <Template
        {...props}
        gameType='quick'
        displayDrawnNumberData={[
            {
                isPlayerWinner: true,
                number: 1241,
                ordinal: 1,
                prize: {
                    fiatFormatted: '$100',
                    fiat: 100n,
                    amount: 100n,
                    amountFormatted: '100',
                    nativeToken: 'ETH'
                },
                winner: '0x1234567890123456789012345678901234567890'
            }
        ]}
        roundId={{
            potIndex: 7,
            roundIndex: 1,
            maxRoundsPerPot: 1
        }}
        formattedChance={'25.00%'}
        purchases={[
            {
                index: 1,
                beneficiary: '0x1234567890123456789012345678901234567890',
                entryStart: 1,
                amount: 5,
                payoutInWeth: false
            }
        ]}
    />,
}

export const NoEntries: Story = {
    render: (props: _DrawSummaryDialogProps) => <Template
        {...props}
        displayDrawnNumberData={[]}
        roundId={{ potIndex: 1, roundIndex: 1, maxRoundsPerPot: 10 }}
        formattedChance={'10.00%'}
        formattedDate={''}
        purchases={[]}
        onReplayDraw={() => {}}
    />,
}

export const Loading: Story = {
    render: () => <DrawSummaryLoadingDialog open onClose={() => {}} />,
}
