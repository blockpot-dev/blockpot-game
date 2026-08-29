import { drawOfLabel, prizePoolLabel } from '@/constants/copy'
import { Dialog, DialogContent, DialogTopSection, Button } from '@blockpot-dev/blockpot-design-system'
import { ElevatedIcon } from '@blockpot-dev/blockpot-design-system'
import { PlayIcon, XIcon } from 'lucide-react'
import useDrawRound from '@/hooks/contracts/draw/useDrawRound'
import { useMissedDraw } from '@/providers/MissedDrawProvider'
import { useBlockpotDraw } from '@/providers/BlockpotDrawProvider'
import { useMissedDrawDialogOpen } from '@/providers/ModalOpenStateProvider'
import { GameType } from '@/providers/SelectedGameProvider'

export type MissedDrawDialogProps = {
    roundIndex: number
    gameType: GameType
}

export default function MissedDrawDialog(props: MissedDrawDialogProps) {
    const { roundIndex, gameType } = props
    const round = useDrawRound(roundIndex)
    const { markRoundAsSeen } = useMissedDraw()
    const { replayDraw } = useBlockpotDraw()
    const missedDrawDialogOpen = useMissedDrawDialogOpen()

    const handleClose = () => {
        markRoundAsSeen(roundIndex)
        missedDrawDialogOpen.update(false)
    }

    const handleWatchDraw = () => {
        replayDraw(roundIndex)
        markRoundAsSeen(roundIndex)
        missedDrawDialogOpen.update(false)
    }

    const drawLabel = round
        ? (gameType === 'quick'
            ? prizePoolLabel(round.potIndex.toString())
            : `${prizePoolLabel(round.potIndex.toString())} - ${drawOfLabel((round.roundIndexInPot + 1).toString(), round.maxRoundsInPot)}`)
        : null

    return (
        <Dialog open={missedDrawDialogOpen.value} onOpenChange={handleClose}>
            <DialogContent showCloseButton={false}>
                <DialogTopSection
                    icon={<ElevatedIcon src='/assets/pngs/clock-badge.png' alt='' />}
                    title='A draw ran while you were away'
                />
                <div className='px-4 pb-4'>
                    {drawLabel === null && (
                        <p className='text-base text-secondary-foreground text-center' role='status'>Loading draw…</p>
                    )}
                    {drawLabel !== null && (
                        <p className='text-base text-secondary-foreground text-center'>
                            {'The draw for '}<span className='font-bold text-foreground'>{drawLabel}</span>{' has already taken place. Replay it or check the result on-chain.'}
                        </p>
                    )}
                    <div className='flex justify-center pt-6'>
                        <Button
                            onClick={handleWatchDraw}
                            disabled={drawLabel === null}
                            className='uppercase font-bold'
                        >
                            <PlayIcon size={20} />
                            Replay draw
                        </Button>
                    </div>
                </div>
                <Button
                    variant='ghost'
                    size='icon'
                    className='absolute top-4 right-4 size-6 p-0'
                    onClick={handleClose}
                    aria-label='Close'
                >
                    <XIcon className='size-6' />
                </Button>
            </DialogContent>
        </Dialog>
    )
}
