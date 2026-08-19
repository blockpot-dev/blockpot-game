import { useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import BlockpotBalances from './BlockpotBalances'
import TierThresholds from './TierThresholds'
import DrawFairnessProof from './DrawFairnessProof/DrawFairnessProof'
import useGameLatestRoundIndex from '@/hooks/contracts/draw/useGameLatestRoundIndex'
import { useSelectedGame } from '@/providers/SelectedGameProvider'

// Per-completed-round fairness proof with a round stepper. Defaults to the
// `?round=` search param (the DrawSummaryDialog entry point) and otherwise to
// the most recent previous round.
function DrawFairnessSection() {
    const { round: roundFromSearch } = useSearch({ from: '/transparency' })
    const { selectedGame } = useSelectedGame()
    const latestRoundIndex = useGameLatestRoundIndex(selectedGame)
    const [selectedRound, setSelectedRound] = useState<number | undefined>(roundFromSearch)

    if (latestRoundIndex === undefined) return null

    const defaultRound = Math.max(latestRoundIndex - 1, 0)
    const roundIndex = Math.min(selectedRound ?? defaultRound, latestRoundIndex)

    return (
        <VStack className='gap-4'>
            <HStack className='justify-between items-center'>
                <h2 className='text-xl font-semibold'>Draw fairness</h2>
                <HStack className='gap-2 items-center'>
                    <Button
                        variant='outline'
                        size='icon'
                        aria-label='Previous round'
                        disabled={roundIndex <= 0}
                        onClick={() => setSelectedRound(roundIndex - 1)}
                    >
                        <ChevronLeftIcon size={16} />
                    </Button>
                    <span className='text-sm text-secondary-foreground min-w-20 text-center'>
                        Round {roundIndex}
                    </span>
                    <Button
                        variant='outline'
                        size='icon'
                        aria-label='Next round'
                        disabled={roundIndex >= latestRoundIndex}
                        onClick={() => setSelectedRound(roundIndex + 1)}
                    >
                        <ChevronRightIcon size={16} />
                    </Button>
                </HStack>
            </HStack>
            <DrawFairnessProof roundIndex={roundIndex} />
        </VStack>
    )
}

export default function Transparency() {
    return (
        <div className='@container w-full h-full'>
            <div className='@min-xs:max-w-[1348px] mx-auto mt-8 mb-auto'>
                <VStack className='gap-8 p-6'>
                    <h1 className='heading-4xl text-foreground'>Transparency</h1>

                    <p className='text-sm text-secondary-foreground max-w-2xl'>
                        Every draw, every payout, every pot allocation happens on-chain and is
                        independently verifiable. This page surfaces the live contract state so
                        you can check it for yourself.
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <BlockpotBalances />
                        <TierThresholds />
                    </div>

                    <DrawFairnessSection />
                </VStack>
            </div>
        </div>
    )
}
