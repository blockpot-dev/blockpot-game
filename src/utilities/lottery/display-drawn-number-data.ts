import { FiatConverter } from '@/hooks/utilities/useFiatConverter'
import { DrawnNumber } from '@/types/lottery'
import { DisplayDrawnNumberData } from '@/types/lottery/display-drawn-number-data'
import { Amounts } from '@/types/lottery/tokens'
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