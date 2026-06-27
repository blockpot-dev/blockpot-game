import HStack from '@/components/core/HStack/HStack'
import GameTypeItem from '../../header/GameTypeItem'
import { Button } from '@blockpot-dev/block-pot-design-system'
import Binding from '@/utilities/binding'
import { History } from 'lucide-react'
import { GameType, useSelectedGame } from '@/providers/SelectedGameProvider'

export type PlayHeaderPureProps = {
    isPreviousRoundsOpen: Binding<boolean>
    selectedGame: GameType
    setSelectedGame: (gameType: GameType) => void
}

export function PlayHeaderPure(props: PlayHeaderPureProps) {
    const { isPreviousRoundsOpen, selectedGame, setSelectedGame } = props
    return (
        <div className='@container w-full bg-[#1D1F33] border-b border-gray-700'>
            <div className='w-full @min-xs:max-w-[1348px] mx-auto h-12 flex items-center gap-2 !overflow-visible'>
                <HStack className='justify-between w-full h-full items-center'>
                    <HStack className='gap-8 h-full'>
                        <GameTypeItem isSelected={selectedGame === 'main'} onClick={() => setSelectedGame('main')}>
                            Main Game
                        </GameTypeItem>
                        <GameTypeItem isSelected={selectedGame === 'quick'} onClick={() => setSelectedGame('quick')}>
                            Quick Game
                        </GameTypeItem>
                    </HStack>
                    <Button variant='ghost' size='sm' className='h-7 normal-case gap-1' onClick={() => isPreviousRoundsOpen.update(true)}>
                        <History size={20} className='translate-y-0.25' />
                        Previous Rounds
                    </Button>
                </HStack>
            </div>
        </div>
    )
}

export type PlayHeaderProps = Omit<PlayHeaderPureProps, 'selectedGame' | 'setSelectedGame'>

export default function PlayHeader(props: PlayHeaderProps) {
    const { selectedGame, setSelectedGame } = useSelectedGame()
    return (
        <PlayHeaderPure {...props} selectedGame={selectedGame} setSelectedGame={setSelectedGame} />
    )
}