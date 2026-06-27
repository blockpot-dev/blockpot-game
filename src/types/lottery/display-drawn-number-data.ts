import { Address } from 'viem'
import { Amounts } from './tokens'

export type DisplayDrawnNumberData = {
    isPlayerWinner: boolean
    number: number
    ordinal: number
    prize: Amounts
    winner: Address
}