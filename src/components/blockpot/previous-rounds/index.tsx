import { TERM } from '@/constants/copy'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import usePreviousRoundsList, { PreviousRoundsFilter } from '@/hooks/contracts/draw/usePreviousRoundsList'
import { Button, SegmentedControl } from '@blockpot-dev/blockpot-design-system'
import { IconHistory } from '@tabler/icons-react'
import { XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import PreviousRound from './PreviousRound/PreviousRound'
import { Address } from 'viem'
import Binding from '@/utilities/binding'
import { cn } from '@/lib/utils'
import { useBlockpotDraw } from '@/providers/BlockpotDrawProvider'

const FILTER_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: TERM.mainGame, value: 'main' },
    { label: TERM.quickGame, value: 'quick' },
]

export type PreviousRoundsProps = {
    accountAddress: Address
    isOpen: Binding<boolean>
}

export default function PreviousRounds(props: PreviousRoundsProps) {
    const { accountAddress, isOpen } = props
    const { viewRoundSummary } = useBlockpotDraw()
    const overlayRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [filter, setFilter] = useState<PreviousRoundsFilter>('all')

    useEffect(() => {
        if (isOpen.value) {
            setIsMounted(true)
            setFilter('all')
            requestAnimationFrame(() => setIsVisible(true))
        } else {
            setIsVisible(false)
        }
    }, [isOpen.value])

    useEffect(() => {
        const element = panelRef.current
        if (!element) return

        const onEnd = (e: TransitionEvent) => {
            if (e.target !== element) return
            if (!isVisible) {
                setIsMounted(false)
            }
        }

        element.addEventListener('transitionend', onEnd)
        return () => element.removeEventListener('transitionend', onEnd)
    }, [isVisible])

    const { items, loadMore, hasMore } = usePreviousRoundsList({ filter })

    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 136,
        overscan: 5,
    })

    const virtualItems = virtualizer.getVirtualItems()
    const loadMoreFiredRef = useRef(false)

    useEffect(() => {
        loadMoreFiredRef.current = false
    }, [items.length])

    useEffect(() => {
        if (!hasMore || virtualItems.length === 0) return
        const lastVisibleIndex = virtualItems[virtualItems.length - 1].index
        if (lastVisibleIndex >= items.length - 1 - 5 && !loadMoreFiredRef.current) {
            loadMoreFiredRef.current = true
            loadMore()
        }
    }, [virtualItems, items.length, hasMore, loadMore])

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0 })
    }, [filter])

    if (!isMounted) return null

    return (
        <div
            ref={overlayRef}
            className={
                cn(
                    'absolute top-0 left-0 w-full h-full z-10 bg-gray-950/50 transition-opacity duration-300 overflow-hidden',
                    isVisible ? 'opacity-100' : 'opacity-0'
                )
            }
            onClick={(e) => {
                if (overlayRef.current !== e.target) return
                isOpen.update(false)
            }}
        >
            <div
                ref={panelRef}
                className={
                    cn(
                        'absolute top-0 right-0 h-full w-[358px] bg-[#212439] border-l border-gray-700 transition-transform duration-300 ease-in-out flex flex-col',
                        isVisible ? 'translate-x-0' : 'translate-x-full'
                    )
                }
            >
                <VStack className='p-6 flex-shrink-0'>
                    <HStack className='justify-between items-center'>
                        <HStack className='items-center'>
                            <IconHistory size={24} />
                            <h2 className='heading-xl'>{TERM.pastDraws}</h2>
                        </HStack>
                        <Button variant='ghost' size='icon' onClick={() => {
                            isOpen.update(false)
                        }}>
                            <XIcon size={24} />
                        </Button>
                    </HStack>
                    <SegmentedControl
                        onSelect={(value) => setFilter(value as PreviousRoundsFilter)}
                        options={FILTER_OPTIONS}
                        selectedOption={filter}
                    />
                </VStack>
                <div ref={scrollRef} className='flex-1 overflow-y-auto px-6 pb-6'>
                    <div style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
                        {
                            virtualItems.map((virtualItem) => {
                                const item = items[virtualItem.index]
                                if (!item) return null
                                return (
                                    <div
                                        key={item.key}
                                        ref={virtualizer.measureElement}
                                        data-index={virtualItem.index}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            transform: `translateY(${virtualItem.start}px)`,
                                            paddingBottom: 16,
                                        }}
                                    >
                                        <PreviousRound
                                            roundIndex={item.roundIndex}
                                            gameType={item.gameType}
                                            accountAddress={accountAddress}
                                            viewRoundSummary={viewRoundSummary}
                                        />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
