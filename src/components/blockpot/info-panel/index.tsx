import styles from './InfoPanel.module.css'
import { Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import Purchase from './purchases/Purchase'
import { PurchaseData } from '@/types/draw/purchase'
import { ContainerHeading } from '@/components/core/ContainerHeading'
import { memo, useEffect, useRef, useState } from 'react'
import { usePrevious } from '@/hooks/utilities/usePrevious'
import { BlockpotDraw, useBlockpotDraw } from '@/providers/BlockpotDrawProvider'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { Address } from 'viem'

export type _InfoPanelProps = {
    isConnected: boolean
    purchases: PurchaseData[]
    setAnimationsEnabled: (animationsEnabled: boolean) => void
    animationsEnabled: boolean
    setLastPurchaseId: (lastPurchaseId: number) => void
    lastPurchaseId: number | null
    draw?: BlockpotDraw
    accountAddress: Address
    /** True while the player's entries for this round are still being read. */
    isLoading?: boolean
}

export function _InfoPanel(props: _InfoPanelProps) {
    const { isConnected, purchases, setAnimationsEnabled, animationsEnabled, setLastPurchaseId, lastPurchaseId, draw, accountAddress, isLoading = false } = props
    const previousPurchases = usePrevious(purchases)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const purchasesWithPlaceholders: (PurchaseData | 'placeholder')[] = [...purchases]
    while (purchasesWithPlaceholders.length < 4) {
        purchasesWithPlaceholders.push('placeholder')
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimationsEnabled(true)
        }, 1000)
        return () => clearTimeout(timeout)
    }, [setAnimationsEnabled])

    useEffect(() => {
        if (!previousPurchases || !animationsEnabled) { return }
        if (purchases.length - previousPurchases.length == 1) {
            setLastPurchaseId(purchases[purchases.length - 1].id)

            // Scroll to the last purchase (at the bottom of the scroll view)
            const scrollContainer = scrollContainerRef.current
            if (scrollContainer) {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: 'smooth'
                })
            }
        }
    }, [purchases, previousPurchases, animationsEnabled, setLastPurchaseId])

    return (
        <Container containerClassName='w-[300px]' className='p-6 h-full'>
            <VStack className='gap-4'>
                <VStack className='gap-4'>
                    <ContainerHeading>Your Entries</ContainerHeading>
                    <span className='text-sm text-gray-400 leading'>
                        {'Your entries in this draw.'}
                    </span>
                </VStack>
                <VStack ref={(node) => { scrollContainerRef.current = node }} className={`gap-4 -mx-4 pt-4 pl-4 pr-3 overflow-y-auto h-[556px] max-h-[556px] ${styles.infoPanelPurchases}`}>
                    <VStack className={'gap-4 flex-1'}>
                        {purchasesWithPlaceholders.map((purchase, index) => (
                            <Purchase
                                key={purchase === 'placeholder' ? `p-${index}` : purchase.id}
                                purchase={purchase}
                                isFirst={index === 0}
                                isConnected={isConnected}
                                isLoading={isLoading}
                                animationsEnabled={(lastPurchaseId === (purchase === 'placeholder' ? -1 : purchase.id)) && animationsEnabled}
                                draw={draw}
                                accountAddress={accountAddress}
                            />
                        ))}
                        <div className='grow' />
                    </VStack>
                </VStack>
            </VStack>
        </Container>
    )
}

export type InfoPanelProps = {
    isConnected: boolean
    purchases: PurchaseData[]
    isLoading?: boolean
};

function InfoPanel(props: InfoPanelProps) {
    const { purchases, isConnected, isLoading } = props
    const { draw } = useBlockpotDraw()
    const accountAddress = useAccountAddress()
    const [animationsEnabled, setAnimationsEnabled] = useState(false)
    const [lastPurchaseId, setLastPurchaseId] = useState<number | null>(null)

    return (
        <_InfoPanel
            isConnected={isConnected}
            purchases={purchases}
            isLoading={isLoading}
            setAnimationsEnabled={setAnimationsEnabled}
            animationsEnabled={animationsEnabled}
            setLastPurchaseId={setLastPurchaseId}
            lastPurchaseId={lastPurchaseId}
            draw={draw}
            accountAddress={accountAddress}
        />
    )
}

export default memo(InfoPanel)