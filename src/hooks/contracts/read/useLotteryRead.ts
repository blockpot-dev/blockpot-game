import { lotteryAbi } from '@/abi/lotteryAbi'
import useReadContract from './useReadContract'
import { GameType, useSelectedGame } from '@/providers/SelectedGameProvider'
import { ContractName } from '@/constants/contract-addresses'

export default function useLotteryRead(gameTypeOverride?: GameType) {
    const { gameContractName: defaultContractName, selectedGame: defaultSelectedGame } = useSelectedGame()
    const selectedGame: GameType = gameTypeOverride ?? defaultSelectedGame
    const gameContractName = gameTypeOverride
        ? (gameTypeOverride === 'main' ? ContractName.LOTTERY_MAIN : ContractName.QUICK_GAME)
        : defaultContractName
    const game = useReadContract(gameContractName, lotteryAbi).read
    return {
        gameContractName,
        selectedGame,
        game
    }
}
