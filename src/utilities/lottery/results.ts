import { LotteryRound } from '@/types/lottery'
import { Address, isAddressEqual } from 'viem'

export type DrawnNumberResult = {
    type: 'no-winner'
} | {
    type: 'user-won'
    address: Address
    prize: bigint
} | {
    type: 'has-winner'
    address: Address
    prize: bigint
}

export type DrawnNumberWithResult = {
    index: number
    number: number
    result: DrawnNumberResult
}

export function getDrawnNumbersWithResults(round: LotteryRound, account: Address): DrawnNumberWithResult[] {
    return round.draws.map((d, index) => {
        const hasWinner = d.prize > 0n
        let result: DrawnNumberResult
        if (hasWinner) {
            if (isAddressEqual(d.winner, account)) {
                result = {
                    type: 'user-won',
                    address: account,
                    prize: d.prize
                }
            } else {
                result = {
                    type: 'has-winner',
                    address: d.winner,
                    prize: d.prize
                }
            } 
        } else {
            result = {
                type: 'no-winner'
            }
        }
        return {
            index: index,
            number: d.number,
            result
        }
    })
}