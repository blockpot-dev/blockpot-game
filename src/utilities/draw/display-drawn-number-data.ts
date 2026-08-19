import { FiatConverter } from '@/hooks/utilities/useFiatConverter'
import { DrawnNumber } from '@/types/draw'
import { DisplayDrawnNumberData } from '@/types/draw/display-drawn-number-data'
import { Amounts } from '@/types/draw/tokens'
import { Address } from 'viem'
import { formatEtherMaxDecimalsGreedy } from '../formatters'
import { isPlayerWinner } from './is-player-winner'

export function createDisplayDrawnNumberData(drawnNumbers: DrawnNumber[], accountAddress: Address, nativeToken: string, fiatConverter: FiatConverter): DisplayDrawnNumberData[] {
    return drawnNumbers.map((draw, index) => {
        const fiatConversionResult = fiatConverter(draw.prize)

        const prize: Amounts = {
            fiatFormatted: fiatConversionResult.formattedValue,
            fiat: fiatConversionResult.value,
            amount: draw.prize,
            amountFormatted: formatEtherMaxDecimalsGreedy(draw.prize, 2),
            nativeToken: nativeToken
        }
        return {
            isPlayerWinner: isPlayerWinner(draw.winner, accountAddress),
            prize: prize,
            number: draw.number,
            ordinal: index + 1,
            winner: draw.winner
        }
    })
}