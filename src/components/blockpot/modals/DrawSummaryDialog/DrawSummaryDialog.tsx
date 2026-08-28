import VStack from '@/components/core/VStack/VStack'
import { Button, Container, Dialog, DialogContent, DialogHeader, DialogTitle } from '@blockpot-dev/blockpot-design-system'
import DrawnNumberTicket from '../../common/DrawnNumberTicket/DrawnNumberTicket'
import { PlayIcon, ShareIcon, ShieldCheckIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import HStack from '@/components/core/HStack/HStack'
import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { DisplayDrawnNumberData } from '@/types/draw/display-drawn-number-data'
import { DrawEntry, DrawRoundId } from '@/types/draw'
import RoundInfoStat from '../../common/RoundInfoStat/RoundInfoStat'
import HighlightDivider from '../../common/HighlightDivider/HighlightDivider'
import useDrawRound from '@/hooks/contracts/draw/useDrawRound'
import { formatNumberMaxDecimalsGreedy } from '@/utilities/formatters'
import { useAccount } from 'wagmi'
import { ZERO_ADDRESS } from '@/web3/constants'
import { createDisplayDrawnNumberData } from '@/utilities/draw/display-drawn-number-data'
import useFiatConverter from '@/hooks/utilities/useFiatConverter'
import useNativeCurrency from '@/hooks/web3/useNativeCurrency'
import usePlayerEntries from '@/hooks/contracts/draw/usePlayerEntries'
import { formatDateWithTime } from '@/utilities/time/format-date'
import { GameType } from '@/providers/SelectedGameProvider'

function DrawEntryRow(props: { entry: DrawEntry }) {
    const { entry } = props
    const entryEnd = entry.entryStart + entry.amount - 1
    return <TableRow>
        <TableCell className="pl-4">#{entry.index.toString()}</TableCell>
        <TableCell>{entry.amount}</TableCell>
        <TableCell>{entry.entryStart}</TableCell>
        <TableCell>{entryEnd === entry.entryStart ? '-' : entryEnd}</TableCell>
    </TableRow>
}

export type _DrawSummaryDialogProps = {
    open: boolean
    onClose: () => void

    formattedChance: string
    formattedDate: string
    roundId: DrawRoundId
    displayDrawnNumberData: DisplayDrawnNumberData[]
    purchases: DrawEntry[]
    gameType: GameType
    onReplayDraw: (roundIndex: number) => void
    // Contract-level round index (not the in-pot display index) — target of the
    // /transparency fairness-proof link.
    proofRoundIndex: number
}

export function _DrawSummaryDialog(props: _DrawSummaryDialogProps) {
    const { displayDrawnNumberData, roundId, formattedChance, purchases, formattedDate, gameType, onReplayDraw, proofRoundIndex } = props

    const totalTickets = purchases.reduce((acc, purchase) => acc + (purchase.amount), 0)

    // TODO: Add 'You Won' badge for matches
    const { open, onClose } = props
    return <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='lg:min-w-[576px]'>
            <DialogHeader className='flex flex-row justify-between pr-4'>
                <DialogTitle className='uppercase'>Draw Summary</DialogTitle>
                <span className='text-sm text-secondary-foreground'>{formattedDate}</span>
            </DialogHeader>
            <VStack className='pt-6 gap-6 overflow-y-auto min-h-0 pr-2'>
                <Container containerClassName='bg-gray-950' className="p-6">
                    <HStack className='gap-0'>
                        <RoundInfoStat label='Pot No.' value={roundId.potIndex.toFixed(0)} />
                        {gameType !== 'quick' && (
                            <>
                                <HighlightDivider direction='vertical' />
                                <RoundInfoStat label='Round No.' value={`${roundId.roundIndex.toFixed(0)}/${roundId.maxRoundsPerPot.toFixed(0)}`} />
                            </>
                        )}
                        <HighlightDivider direction='vertical' />
                        <RoundInfoStat label='Chance' value={formattedChance} />
                    </HStack>
                </Container>
                <VStack className='gap-6'>
                    <span className='text-sm'>Drawn Numbers:</span>
                    <div className='grid grid-cols-2 gap-6'>
                        {
                            displayDrawnNumberData.map((drawnNumber) => (
                                <DrawnNumberTicket key={drawnNumber.number} drawnNumber={drawnNumber} animate={false} advanceDraw={() => {}} />
                            ))
                        }
                    </div>
                </VStack>
                <HStack className='gap-4'>
                    <Button variant='outline' className='flex-1' onClick={() => onReplayDraw(roundId.roundIndex)}>
                        <PlayIcon size={24} />
                        <span>Replay draw</span>
                    </Button>
                    <Button variant='outline' className='flex-1'>
                        <ShareIcon size={24} />
                        <span>Share</span>
                    </Button>
                    <Link to='/transparency' search={{ game: gameType, round: proofRoundIndex }} className='flex-1' onClick={onClose}>
                        <Button variant='outline' className='w-full'>
                            <ShieldCheckIcon size={24} />
                            <span>Fairness proof</span>
                        </Button>
                    </Link>
                </HStack>
                <VStack>
                    <HStack className='justify-between'>
                        <span className='text-sm'>Your Purchases:</span>
                        <span className='text-sm'>
                            <span className='text-secondary-foreground'>{'Total Tickets: '}</span>
                            <span className='font-bold text-foreground'>{totalTickets}</span>
                        </span>
                    </HStack>
                    <Table className='after:content-[""] after:absolute after:inset-0 after:border after:border-gray-700 after:rounded-lg'>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-4">Purchase No.</TableHead>
                                <TableHead>Tickets</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead className="pr-4">To</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                purchases.map((purchase) => (
                                    <DrawEntryRow key={purchase.index} entry={purchase} />
                                ))
                            }
                        </TableBody>
                    </Table>
                </VStack>
            </VStack>
        </DialogContent>
    </Dialog>
}

export type DrawSummaryDialogProps = {
    open: boolean
    onClose: () => void
    onReplayDraw: (roundIndex: number) => void
    roundIndex: number
    gameType: GameType
}

export default function DrawSummaryDialog(props: DrawSummaryDialogProps) {
    const { open, onClose, roundIndex, gameType, onReplayDraw } = props
    const round = useDrawRound(roundIndex, gameType)
    const { address } = useAccount()
    const nativeToken = useNativeCurrency()
    const fiatConverter = useFiatConverter()
    const playerEntries = usePlayerEntries(Number(roundIndex), gameType)

    if (!round) return null

    let formattedDate = ''
    if (round) {
        formattedDate = formatDateWithTime(new Date(round.drawTime))
    }

    return <_DrawSummaryDialog
        open={open}
        onClose={onClose}
        roundId={{
            potIndex: round.potIndex,
            roundIndex: round.roundIndexInPot + 1,
            maxRoundsPerPot: round.maxRoundsInPot
        }}
        displayDrawnNumberData={createDisplayDrawnNumberData(
            [...round.draws],
            address ?? ZERO_ADDRESS,
            nativeToken,
            fiatConverter
        )}
        formattedChance={`${formatNumberMaxDecimalsGreedy(round.chance / 100, 0, 2)}%`}
        purchases={playerEntries?.entries ?? []}
        formattedDate={formattedDate}
        gameType={gameType}
        onReplayDraw={() => onReplayDraw(Number(roundIndex))}
        proofRoundIndex={Number(roundIndex)}
    />
}