import { Meta, StoryObj } from '@storybook/react'
import { Address } from 'viem'
import DrawnNumberTicket from './DrawnNumberTicket'
import { createDisplayDrawnNumberData } from '@/utilities/draw/display-drawn-number-data'
import { DrawnNumber } from '@/types/draw'
import { FiatConverter } from '@/hooks/utilities/useFiatConverter'

// Same wallet — viem returns EIP-55 checksummed; wallet connectors may return lowercase.
// `===` would treat these as different addresses; isAddressEqual must treat them as equal.
const WINNER_CHECKSUMMED = '0xA8D5dD58D9F90C3a6D5DA1eC9722DB69d1f0338F' as Address
const ACCOUNT_LOWERCASE = '0xa8d5dd58d9f90c3a6d5da1ec9722db69d1f0338f' as Address
const STRANGER_WALLET = '0x1111111111111111111111111111111111111111' as Address

const fiatConverter: FiatConverter = (amount: bigint) => ({
    value: amount,
    formattedValue: '$0.00',
})

function buildDrawnNumber(winner: Address, account: Address, number: number = 42) {
    const draws: DrawnNumber[] = [
        { winner, number, prize: 1_000_000_000_000_000_000n },
    ]
    return createDisplayDrawnNumberData(draws, account, 'eth', fiatConverter)[0]
}

const meta: Meta<typeof DrawnNumberTicket> = {
    component: DrawnNumberTicket,
    args: {
        animate: false,
        advanceDraw: () => {},
    },
}
export default meta
type Story = StoryObj<typeof DrawnNumberTicket>

// Regression scenario for task 51: winner returned by viem (EIP-55) vs wallet (lowercase).
// Pre-fix used strict equality between checksummed and lowercase strings → neutral silver variant.
// Post-fix uses isAddressEqual → gold "you won" variant.
export const PlayerWonMixedCaseAddresses: Story = {
    args: {
        drawnNumber: buildDrawnNumber(WINNER_CHECKSUMMED, ACCOUNT_LOWERCASE),
    },
}

export const StrangerWonNeutralVariant: Story = {
    args: {
        drawnNumber: buildDrawnNumber(WINNER_CHECKSUMMED, STRANGER_WALLET),
    },
}

export const Digits6: Story = {
    args: {
        drawnNumber: buildDrawnNumber(WINNER_CHECKSUMMED, STRANGER_WALLET, 999_999),
    },
}

export const Digits7: Story = {
    args: {
        drawnNumber: buildDrawnNumber(WINNER_CHECKSUMMED, STRANGER_WALLET, 1_164_026),
    },
}

export const Digits9: Story = {
    args: {
        drawnNumber: buildDrawnNumber(WINNER_CHECKSUMMED, STRANGER_WALLET, 123_456_789),
    },
}

export const Digits12: Story = {
    args: {
        drawnNumber: buildDrawnNumber(WINNER_CHECKSUMMED, STRANGER_WALLET, 999_999_999_999),
    },
}
