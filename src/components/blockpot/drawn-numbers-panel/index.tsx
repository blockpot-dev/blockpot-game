import styles from './DrawnNumbersPanel.module.css'
import { Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import { ContainerHeading } from '@/components/core/ContainerHeading'
import DrawnNumberTicket from '../common/DrawnNumberTicket/DrawnNumberTicket'
import { StagedDraw } from '@/providers/BlockpotDrawProvider'
import { memo, useEffect, useRef } from 'react'
import { DisplayDrawnNumberData } from '@/types/draw/display-drawn-number-data'

export type DrawnNumbersPanelProps = {
    stagedDraw: StagedDraw
    totalDrawnNumbers: number
    advanceDraw: () => void
};

function DrawnNumbersPanel(props: DrawnNumbersPanelProps) {
    const { stagedDraw, totalDrawnNumbers, advanceDraw } = props
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const drawnNumbersWithPlaceholders: (DisplayDrawnNumberData | 'placeholder')[] = [...stagedDraw.drawnNumbers]
    while (drawnNumbersWithPlaceholders.length < 4) {
        drawnNumbersWithPlaceholders.push('placeholder')
    }

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [stagedDraw.drawnNumbers.length])

    return (
        <Container containerClassName='w-[300px]' className='p-6 h-full'>
            <VStack className='gap-4'>
                <VStack className='gap-4'>
                    <ContainerHeading trailing={
                        <span className='body-lg font-bold leading-none'>{`${stagedDraw.drawnNumbers.length.toFixed(0)} of ${totalDrawnNumbers.toFixed(0)} drawn`}</span>
                    }>
                        Drawn Numbers
                    </ContainerHeading>
                    <span className='text-sm text-gray-400 leading'>
                        {'Numbers drawn so far. Match one to claim a prize.'}
                    </span>
                </VStack>
                <VStack ref={(node) => { scrollContainerRef.current = node }} className={`gap-4 -mx-4 pt-4 px-4 overflow-y-hidden h-[556px] max-h-[556px] ${styles.drawnNumbersPanelPurchases}`}>
                    <VStack className={'gap-4 flex-1'}>
                        {drawnNumbersWithPlaceholders.map((drawnNumber, index) => {
                            const isLastTicket = index === stagedDraw.drawnNumbers.length - 1 && drawnNumber !== 'placeholder'
                            return (
                                <DrawnNumberTicket
                                    key={drawnNumber === 'placeholder' ? `p-${index}` : drawnNumber.number}
                                    drawnNumber={drawnNumber}
                                    isLastTicket={isLastTicket}
                                    placeholderOrdinal={index + 1}
                                    advanceDraw={advanceDraw}
                                />
                            )
                        })}
                        <div className='grow' />
                    </VStack>
                </VStack>
            </VStack>
        </Container>
    )
}

export default memo(DrawnNumbersPanel)