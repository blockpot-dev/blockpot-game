import { KeyboardEvent, useEffect, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import GameTypeToggle from '@/components/blockpot/common/GameTypeToggle/GameTypeToggle'
import DrawFairnessProof from '../DrawFairnessProof/DrawFairnessProof'
import useGameLatestRoundIndex from '@/hooks/contracts/draw/useGameLatestRoundIndex'
import { GameType, useSelectedGame } from '@/providers/SelectedGameProvider'

export type DrawFairnessSectionPureProps = {
    game: GameType
    onGameChange: (game: GameType) => void
    roundIndex: number
    latestRoundIndex: number
    onRoundChange: (roundIndex: number) => void
}

function clampRound(value: number, latestRoundIndex: number): number {
    return Math.min(Math.max(value, 0), latestRoundIndex)
}

/** Props-driven view (storybook + test target): game toggle, ◀ [round] ▶ stepper, Latest shortcut. */
export function DrawFairnessSectionPure(props: DrawFairnessSectionPureProps) {
    const { game, onGameChange, roundIndex, latestRoundIndex, onRoundChange } = props
    const [draft, setDraft] = useState(String(roundIndex))

    useEffect(() => {
        setDraft(String(roundIndex))
    }, [roundIndex])

    const commit = () => {
        const parsed = Number(draft)
        if (draft.trim() === '' || !Number.isInteger(parsed)) {
            setDraft(String(roundIndex))
            return
        }
        const next = clampRound(parsed, latestRoundIndex)
        setDraft(String(next))
        if (next !== roundIndex) onRoundChange(next)
    }

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            commit()
            e.currentTarget.blur()
        } else if (e.key === 'Escape') {
            setDraft(String(roundIndex))
            e.currentTarget.blur()
        }
    }

    return (
        <VStack className='gap-4'>
            <HStack className='justify-between items-center flex-wrap gap-4'>
                <HStack className='gap-8 items-center'>
                    <h2 className='text-xl font-semibold'>Draw fairness</h2>
                    <GameTypeToggle value={game} onChange={onGameChange} />
                </HStack>
                <HStack className='gap-2 items-center'>
                    <Button
                        variant='outline'
                        size='icon'
                        aria-label='Previous round'
                        disabled={roundIndex <= 0}
                        onClick={() => onRoundChange(roundIndex - 1)}
                    >
                        <ChevronLeftIcon size={16} />
                    </Button>
                    <label className='flex items-center gap-1 text-sm text-secondary-foreground'>
                        <span>Round</span>
                        <input
                            type='number'
                            inputMode='numeric'
                            aria-label='Round'
                            min={0}
                            max={latestRoundIndex}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={commit}
                            onKeyDown={onKeyDown}
                            className='w-16 h-9 bg-background border border-border rounded-sm px-2 text-center font-mono text-sm text-foreground focus:outline-none focus:border-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                        />
                    </label>
                    <Button
                        variant='outline'
                        size='icon'
                        aria-label='Next round'
                        disabled={roundIndex >= latestRoundIndex}
                        onClick={() => onRoundChange(roundIndex + 1)}
                    >
                        <ChevronRightIcon size={16} />
                    </Button>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='h-9 normal-case'
                        disabled={roundIndex >= latestRoundIndex}
                        onClick={() => onRoundChange(latestRoundIndex)}
                    >
                        Latest
                    </Button>
                </HStack>
            </HStack>
            <DrawFairnessProof game={game} roundIndex={roundIndex} />
        </VStack>
    )
}

/**
 * Per-completed-round fairness proof with a page-local game selection. The game is seeded from the
 * global SelectedGameProvider (or `?game=`) once on mount and never written back — verifying a Quick
 * Game round must not change what the player is entering on /play. The round defaults to `?round=`
 * (only for the game the link named) and otherwise to the most recent previous round; switching game
 * resets it, since round indices are independent per game.
 */
export default function DrawFairnessSection() {
    const { round: roundFromSearch, game: gameFromSearch } = useSearch({ from: '/transparency' })
    const { selectedGame } = useSelectedGame()
    const [initialGame] = useState<GameType>(gameFromSearch ?? selectedGame)
    const [game, setGame] = useState<GameType>(initialGame)
    const latestRoundIndex = useGameLatestRoundIndex(game)
    const [selectedRound, setSelectedRound] = useState<number | undefined>(
        gameFromSearch === undefined || gameFromSearch === initialGame ? roundFromSearch : undefined
    )

    const onGameChange = (next: GameType) => {
        if (next === game) return
        setGame(next)
        setSelectedRound(undefined)
    }

    if (latestRoundIndex === undefined) return null

    const defaultRound = Math.max(latestRoundIndex - 1, 0)
    const roundIndex = clampRound(selectedRound ?? defaultRound, latestRoundIndex)

    return (
        <DrawFairnessSectionPure
            game={game}
            onGameChange={onGameChange}
            roundIndex={roundIndex}
            latestRoundIndex={latestRoundIndex}
            onRoundChange={setSelectedRound}
        />
    )
}
