import VStack from '@/components/core/VStack/VStack'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@blockpot-dev/blockpot-design-system'
import { XIcon } from 'lucide-react'
import HStack from '@/components/core/HStack/HStack'
import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { useDraw } from '@/providers/BlockpotProvider'
import useFiatConverter, { FiatConverter } from '@/hooks/utilities/useFiatConverter'
import { formatEtherMaxDecimalsGreedy } from '@/utilities/formatters'
import { formatNumberMaxDecimalsGreedy } from '@/utilities/formatters'
import { Link } from '@tanstack/react-router'
import PrizeBadge from '../../current-round/Prizes/PrizeBadge/PrizeBadge'
import LabeledBalance from '../../common/LabeledBalance/LabeledBalance'

type PrizeData = {
    ordinal: number
    percentage: number
    tokenAmountFormatted: string
    fiatFormatted: string
}

function labelForOrdinal(ordinal: number): string {
    switch (ordinal) {
    case 1: return 'Top prize'
    case 2: return '2nd'
    case 3: return '3rd'
    default: return `${ordinal}th`
    }
}

function createPrizesData(pots: readonly bigint[], fiatConverter: FiatConverter, totalPrizePool: bigint): PrizeData[] {
    if (!pots || pots.length === 0) return []

    const prizes: PrizeData[] = pots.map((pot, index) => {
        return {
            ordinal: index + 1,
            // Before any entries the pool is empty; show each prize at 0% rather
            // than dividing by zero (which would throw on bigint division).
            percentage: totalPrizePool === 0n ? 0 : Number((pot * 10000n / totalPrizePool)) / 100,
            tokenAmountFormatted: formatEtherMaxDecimalsGreedy(pot, 2),
            fiatFormatted: fiatConverter(pot).formattedValue
        }
    })
    
    return prizes
}

export type _PrizesOverviewDialogProps = {
    open: boolean
    onClose: () => void
    fiatConverter: FiatConverter
    pots: readonly bigint[]
}

export function _PrizesOverviewDialog(props: _PrizesOverviewDialogProps) {
    const { open, onClose, pots, fiatConverter } = props

    const totalPrizePool = pots.reduce((acc, pot) => acc + pot, 0n)
    const prizes = createPrizesData(pots, fiatConverter, totalPrizePool)
    const drawnNumbersCount = pots.length

    const totalPrizePoolFormatted = formatEtherMaxDecimalsGreedy(totalPrizePool, 2)
    const totalPrizePoolFiat = fiatConverter(totalPrizePool).formattedValue

    return <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='lg:min-w-[576px]' showCloseButton={false} containerContentClassName='p-6'>
            <DialogHeader className='flex flex-row justify-between'>
                <HStack className='gap-4 items-center justify-between w-full'>
                    <DialogTitle className='uppercase heading-xl font-normal h-auto'>Prizes Overview</DialogTitle>
                    <HStack className='items-center gap-6'>
                        <Link to='/how-to-play' className='text-sm underline text-foreground' onClick={() => onClose()}>How to Play</Link>
                        <Button variant='ghost' size='icon' className='size-6 p-0' onClick={onClose}>
                            <XIcon className='size-6' />
                        </Button>
                    </HStack>
                </HStack>
            </DialogHeader>
            <VStack className='pt-6 gap-6'>
                {/* Total Prize Pool */}
                <LabeledBalance
                    label='Total Prize Pool'
                    balance={
                        <HStack>
                            <div className='font-bold'>{totalPrizePoolFormatted}</div>
                            <div className='text-base text-secondary-foreground'>{totalPrizePoolFiat}</div>
                        </HStack>
                    }
                    imageSrc='/assets/svgs/tokens/eth.svg'
                    imageAlt='ETH'
                />
                
                {/* Potential Prize Breakdown */}
                <VStack className='gap-6'>
                    <div>
                        <h3 className='font-bold mb-2'>Potential Prize Breakdown</h3>
                        <p className='text-foreground/80'>
                            {'We\'re drawing '}<strong>{drawnNumbersCount}</strong>{' numbers this round, each with a corresponding prize.'}
                        </p>
                    </div>
                    
                    <Table className='after:content-[""] after:absolute after:inset-0 after:border after:border-gray-700 after:rounded-lg [&_tr]:border-gray-700'>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-4">Drawn Number</TableHead>
                                <TableHead>Percentage</TableHead>
                                <TableHead className="pr-4">Prize</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prizes.map((prize, index) => (
                                <TableRow key={index}>
                                    <TableCell className="pl-4">
                                        <PrizeBadge ordinal={prize.ordinal} className='bg-[#181B31]'>
                                            {labelForOrdinal(prize.ordinal)}
                                        </PrizeBadge>
                                    </TableCell>
                                    <TableCell>{formatNumberMaxDecimalsGreedy(prize.percentage, 0, 2)}%</TableCell>
                                    <TableCell className="pr-4">
                                        <div>
                                            <div className='font-medium'>{prize.tokenAmountFormatted} ETH</div>
                                            <div className='text-sm text-secondary-foreground'>{prize.fiatFormatted}</div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </VStack>
                
                {/* How prizes are paid */}
                <VStack className='gap-2 mb-2'>
                    <h3 className='font-bold'>How prizes are paid</h3>
                    <p className='text-sm text-secondary-foreground'>
                        If one of your entries matches the <strong>n<sup>th</sup></strong> number drawn, it takes the <strong>n<sup>th</sup></strong> prize. Payouts go to your wallet; you can check each one on-chain.
                    </p>
                </VStack>
            </VStack>
        </DialogContent>
    </Dialog>
}

export type PrizesOverviewDialogProps = {
    open: boolean
    onClose: () => void
}

export default function PrizesOverviewDialog(props: PrizesOverviewDialogProps) {
    const { open, onClose } = props
    const { currentRound, pots } = useDraw()
    const fiatConverter = useFiatConverter({ maxDecimals: 0 })

    if (!currentRound || !pots) return null

    return <_PrizesOverviewDialog
        open={open}
        onClose={onClose}
        pots={pots}
        fiatConverter={fiatConverter}
    />
}
