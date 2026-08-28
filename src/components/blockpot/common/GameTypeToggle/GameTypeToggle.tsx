import GameTypeItem from '@/components/blockpot/header/GameTypeItem'
import { GameType } from '@/providers/SelectedGameProvider'
import { cn } from '@/lib/utils'

export type GameTypeToggleProps = {
    value: GameType
    onChange: (game: GameType) => void
    className?: string
}

/** Main Game / Quick Game switch — the same control as the play header, usable with any state owner. */
export default function GameTypeToggle({ value, onChange, className }: GameTypeToggleProps) {
    return (
        <div className={cn('flex flex-row gap-8 h-10', className)} role='tablist' aria-label='Game'>
            <div role='tab' aria-selected={value === 'main'} className='h-full'>
                <GameTypeItem isSelected={value === 'main'} onClick={() => onChange('main')}>Main Game</GameTypeItem>
            </div>
            <div role='tab' aria-selected={value === 'quick'} className='h-full'>
                <GameTypeItem isSelected={value === 'quick'} onClick={() => onChange('quick')}>Quick Game</GameTypeItem>
            </div>
        </div>
    )
}
