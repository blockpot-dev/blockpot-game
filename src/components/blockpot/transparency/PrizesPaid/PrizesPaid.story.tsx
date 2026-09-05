import { Meta, StoryObj } from '@storybook/react'
import { Address } from 'viem'
import { _PrizesPaid } from './PrizesPaid'
import { ZERO_ADDRESS } from '@/web3/constants'

const meta: Meta<typeof _PrizesPaid> = {
    component: _PrizesPaid,
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 560 }}>
                <Story />
            </div>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof _PrizesPaid>

const ALICE = '0x73AB48A14B2D6BCE26B68F11C0894EB5DDD0B657' as Address
const BOB = '0x1111111111111111111111111111111111111111' as Address
const CAROL = '0x9F8E7D6C5B4A39281706F5E4D3C2B1A098765432' as Address

// chainId 1 has a block explorer configured, so the explorer links render.
const CHAIN_ID = 1

// Three prizes paid to three different recipients — the ordinary settled round.
export const Paid: Story = {
    args: {
        draws: [
            { winner: ALICE, number: 7, prize: 1_000_000_000_000_000_000n },
            { winner: BOB, number: 12, prize: 250_000_000_000_000_000n },
            { winner: CAROL, number: 33, prize: 50_000_000_000_000_000n },
        ],
        roundIndex: 42,
        chainId: CHAIN_ID,
    },
}

// The first number matched nobody; the second did. Rank stays positional, so
// the paid row reads "2nd prize" rather than being renumbered to 1st.
export const PartiallyPaid: Story = {
    args: {
        draws: [
            { winner: ZERO_ADDRESS, number: 7, prize: 0n },
            { winner: ALICE, number: 12, prize: 500_000_000_000_000_000n },
        ],
        roundIndex: 43,
        chainId: CHAIN_ID,
    },
}

// No number matched an entry — the pool rolls into the next round.
export const NoMatch: Story = {
    args: {
        draws: [
            { winner: ZERO_ADDRESS, number: 7, prize: 0n },
            { winner: ZERO_ADDRESS, number: 12, prize: 0n },
        ],
        roundIndex: 44,
        chainId: CHAIN_ID,
    },
}

// Reading the round from the chain. Must not show "no match" before it knows.
export const Loading: Story = {
    args: {
        draws: [],
        roundIndex: 45,
        chainId: CHAIN_ID,
        isLoading: true,
    },
}

// A chain with no block explorer configured — copy still works, the link is gone.
export const NoExplorer: Story = {
    args: {
        draws: [{ winner: ALICE, number: 7, prize: 1_000_000_000_000_000_000n }],
        roundIndex: 46,
        chainId: 31337,
    },
}
