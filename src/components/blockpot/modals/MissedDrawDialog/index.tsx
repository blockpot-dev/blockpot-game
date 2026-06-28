import { Dialog, DialogContent, DialogTopSection, Button } from '@blockpot-dev/blockpot-design-system'
import { ElevatedIcon } from '@blockpot-dev/blockpot-design-system'
import { XIcon } from 'lucide-react'
import useLotteryRound from '@/hooks/contracts/lottery/useLotteryRound'
import { useMissedDraw } from '@/providers/MissedDrawProvider'
import { useLotteryDraw } from '@/providers/BlockpotDrawProvider'
import { useMissedDrawDialogOpen } from '@/providers/ModalOpenStateProvider'
import { GameType } from '@/providers/SelectedGameProvider'

export type MissedDrawDialogProps = {
    roundIndex: number
    gameType: GameType
}

export default function MissedDrawDialog(props: MissedDrawDialogProps) {
    const { roundIndex, gameType } = props
    const round = useLotteryRound(roundIndex)
    const { markRoundAsSeen } = useMissedDraw()
    const { replayDraw } = useLotteryDraw()
    const missedDrawDialogOpen = useMissedDrawDialogOpen()

    if (!round) return null

    const handleClose = () => {
        markRoundAsSeen(roundIndex)
        missedDrawDialogOpen.update(false)
    }

    const handleWatchDraw = () => {
        replayDraw(roundIndex)
        markRoundAsSeen(roundIndex)
        missedDrawDialogOpen.update(false)
    }

    const potNumber = round.potIndex.toString()
    const roundNumber = (round.roundIndexInPot + 1).toString()
    const drawLabel = gameType === 'quick' ? `Pot #${potNumber}` : `Pot #${potNumber} - Round ${roundNumber}`

    return (
        <Dialog open={missedDrawDialogOpen.value} onOpenChange={handleClose}>
            <DialogContent showCloseButton={false}>
                <DialogTopSection
                    icon={<ElevatedIcon src='/assets/pngs/clock-badge.png' alt='' />}
                    title='YOU MISSED THE DRAW!'
                />
                <div className='px-4 pb-4'>
                    <p className='text-base text-secondary-foreground text-center'>
                        {'The draw for '}<span className='font-bold text-foreground'>{drawLabel}</span>{' has already taken place. You can rewatch the draw to see if you won.'}
                    </p>
                    <div className='flex justify-center pt-6'>
                        <Button
                            onClick={handleWatchDraw}
                            className='uppercase font-bold'
                        >
                            WATCH THE DRAW
                        </Button>
                    </div>
                </div>
                <Button
                    variant='ghost'
                    size='icon'
                    className='absolute top-4 right-4 size-6 p-0'
                    onClick={handleClose}
                >
                    <XIcon className='size-6' />
                </Button>
            </DialogContent>
        </Dialog>
    )
}
