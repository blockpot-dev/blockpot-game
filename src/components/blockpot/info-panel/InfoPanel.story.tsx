import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { Meta, StoryObj } from '@storybook/react'
import { _InfoPanel, _InfoPanelProps } from '.'
import { useEffect, useState } from 'react'
import { Address, isAddressEqual } from 'viem'
import { resolvePlayerEntries } from '@/utilities/draw/resolve-player-entries'
import { PurchaseData } from '@/types/draw/purchase'

const Template = (props: _InfoPanelProps) => {
    return (
        <HStack>
            <VStack className='w-[256px]'>
                <_InfoPanel {...props} />
            </VStack>
        </HStack>
    )
}

const meta: Meta<typeof _InfoPanel> = {
    component: _InfoPanel,
    args: {},
    argTypes: {}
}

export default meta

const renderStory = (args: _InfoPanelProps) => {
    const [animationsEnabled, setAnimationsEnabled] = useState(true)
    const [lastPurchaseId, setLastPurchaseId] = useState<number | null>(null)
    
    return (
        <Template
            {...args}
            animationsEnabled={animationsEnabled}
            setAnimationsEnabled={setAnimationsEnabled}
            lastPurchaseId={lastPurchaseId}
            setLastPurchaseId={setLastPurchaseId}
            accountAddress={args.accountAddress || '0x0000000000000000000000000000000000000000' as Address}
        />
    )
}

const defaultAddress = '0x1234567890123456789012345678901234567890' as Address

type Story = StoryObj<typeof _InfoPanel>

export const Basic: Story = {
    render: renderStory,
    args: {
        isConnected: false,
        purchases: [],
        accountAddress: defaultAddress
    }
}

export const SinglePurchase: Story = {
    render: renderStory,
    args: {
        isConnected: true,
        purchases: [
            {
                id: 1,
                type: 'single',
                number: 42
            }
        ],
        accountAddress: defaultAddress
    }
}

export const MultiplePurchases: Story = {
    render: renderStory,
    args: {
        isConnected: true,
        purchases: [
            {
                id: 1,
                type: 'single',
                number: 7
            },
            {
                id: 2,
                type: 'multiple',
                numberStart: 100,
                numberEnd: 105
            },
            {
                id: 3,
                type: 'single',
                number: 999
            }
        ],
        accountAddress: defaultAddress
    }
}

export const FullPurchases: Story = {
    render: renderStory,
    args: {
        isConnected: true,
        purchases: [
            {
                id: 1,
                type: 'single',
                number: 1
            },
            {
                id: 2,
                type: 'multiple',
                numberStart: 50,
                numberEnd: 55
            },
            {
                id: 3,
                type: 'single',
                number: 777
            },
            {
                id: 4,
                type: 'multiple',
                numberStart: 1000,
                numberEnd: 1010
            }
        ],
        accountAddress: defaultAddress
    }
}

export const OverflowPurchases: Story = {
    render: renderStory,
    args: {
        isConnected: true,
        purchases: [
            {
                id: 1,
                type: 'single',
                number: 1
            },
            {
                id: 2,
                type: 'multiple',
                numberStart: 50,
                numberEnd: 55
            },
            {
                id: 3,
                type: 'single',
                number: 777
            },
            {
                id: 4,
                type: 'multiple',
                numberStart: 1000,
                numberEnd: 1010
            },
            {
                id: 5,
                type: 'multiple',
                numberStart: 2010,
                numberEnd: 2020
            }
        ],
        accountAddress: defaultAddress
    }
}

export const LargeRangePurchase: Story = {
    render: renderStory,
    args: {
        isConnected: true,
        purchases: [
            {
                id: 1,
                type: 'multiple',
                numberStart: 1,
                numberEnd: 100
            }
        ],
        accountAddress: defaultAddress
    }
}

export const ConnectedNoPurchases: Story = {
    render: renderStory,
    args: {
        isConnected: true,
        purchases: [],
        accountAddress: defaultAddress
    }
}

// Regression scenario for task 52: in v2 the on-chain beneficiary is the LGO contract, so
// useRoundEntryIndexes -> entriesForBeneficiary(round, connectedWallet) is empty and the
// InfoPanel "Your Tickets" list is blank. The fix routes the lookup through
// resolvePlayerEntries which queries entriesForBeneficiary(round, LGO_ADDRESS), then maps
// each entry back to its real owner via lgo.entryOwnerOf, then filters by the connected
// wallet. Pre-fix this story renders zero rows; post-fix it renders one Purchase row
// covering ticket numbers 100..104.
const REGRESSION_ROUND = 7
const REGRESSION_DRAW = '0x0000000000000000000000000000000000000A11' as Address
const REGRESSION_LGO = '0x0000000000000000000000000000000000000B22' as Address
const REGRESSION_PLAYER = '0x0000000000000000000000000000000000000C33' as Address
const REGRESSION_ENTRY_INDEX = 42

const regressionGame = {
    entriesForBeneficiary: async ([round, beneficiary]: readonly [number, Address]) => {
        if (round === REGRESSION_ROUND && isAddressEqual(beneficiary, REGRESSION_LGO)) {
            return [REGRESSION_ENTRY_INDEX]
        }
        return []
    },
    getEntry: async ([entryIndex, round]: readonly [number, number]) => {
        if (entryIndex === REGRESSION_ENTRY_INDEX && round === REGRESSION_ROUND) {
            return {
                beneficiary: REGRESSION_LGO,
                entryStart: 100,
                amount: 5,
                payoutInWeth: false,
            }
        }
        throw new Error(`unexpected getEntry call: entryIndex=${entryIndex}, round=${round}`)
    },
} as unknown as Parameters<typeof resolvePlayerEntries>[4]

const regressionLgo = {
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

function entryToPurchaseData(entry: { index: number, entryStart: number, amount: number }): PurchaseData {
    const entryEnd = entry.entryStart + entry.amount - 1
    if (entry.entryStart === entryEnd) {
        return { id: entry.index, type: 'single', number: Number(entry.entryStart) }
    }
    return { id: entry.index, type: 'multiple', numberStart: Number(entry.entryStart), numberEnd: Number(entryEnd) }
}

function PlayerEntriesResolvedFromLgoOwnershipRender(props: _InfoPanelProps) {
    const [purchases, setPurchases] = useState<PurchaseData[]>([])
    const [animationsEnabled, setAnimationsEnabled] = useState(true)
    const [lastPurchaseId, setLastPurchaseId] = useState<number | null>(null)
    useEffect(() => {
        let cancelled = false
        resolvePlayerEntries(
            REGRESSION_ROUND,
            REGRESSION_PLAYER,
            REGRESSION_DRAW,
            REGRESSION_LGO,
            regressionGame,
            regressionLgo,
        ).then((entries) => {
            if (!cancelled) setPurchases(entries.map(entryToPurchaseData))
        })
        return () => { cancelled = true }
    }, [])
    return (
        <Template
            {...props}
            purchases={purchases}
            animationsEnabled={animationsEnabled}
            setAnimationsEnabled={setAnimationsEnabled}
            lastPurchaseId={lastPurchaseId}
            setLastPurchaseId={setLastPurchaseId}
            accountAddress={REGRESSION_PLAYER}
        />
    )
}

export const PlayerEntriesResolvedFromLgoOwnership: Story = {
    render: (args) => <PlayerEntriesResolvedFromLgoOwnershipRender {...args} />,
    args: {
        isConnected: true,
        purchases: [],
        accountAddress: REGRESSION_PLAYER,
    },
}
