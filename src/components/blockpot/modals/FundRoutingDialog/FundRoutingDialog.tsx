import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@blockpot-dev/blockpot-design-system'
import { XIcon } from 'lucide-react'
import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from '@/components/ui/table'
import useFiatConverter, { FiatConverter } from '@/hooks/utilities/useFiatConverter'
import { formatEther } from 'viem'
import { formatEtherMaxDecimalsGreedy, formatNumberMaxDecimalsGreedy } from '@/utilities/formatters'
import PrizeBadge from '../../current-round/Prizes/PrizeBadge/PrizeBadge'
import { computeFundRouting, FundRoutingEntry } from '@/utilities/fundRouting'
import { GameConfig } from '@/types/lottery/config'
import { GameType } from '@/providers/SelectedGameProvider'

// The util labels the forwarded bucket generically; the dialog knows the actual
// destination (a quick game's parent is the main game) and relabels for display.
function parentLabel(selectedGame: GameType, fallback: string): string {
    return selectedGame === 'quick' ? 'Main game' : fallback
}

function AmountCell({ amount, fiatConverter }: { amount: bigint, fiatConverter: FiatConverter }) {
    return (
        <div>
            {/* Exact ETH — these per-pot amounts are sub-0.01 ETH and must not be
                rounded to 0; formatEther trims trailing zeros without truncating. */}
            <div className='font-medium'>{formatEther(amount)} ETH</div>
            <div className='text-sm text-secondary-foreground'>{fiatConverter(amount).formattedValue}</div>
        </div>
    )
}

function percentLabel(entry: FundRoutingEntry): string {
    return `${formatNumberMaxDecimalsGreedy(entry.percent, 0, 2)}%`
}

export type _FundRoutingDialogProps = {
    open: boolean
    onClose: () => void
    pea: bigint
    gameConfig: GameConfig
    selectedGame: GameType
    fiatConverter: FiatConverter
}

export function _FundRoutingDialog(props: _FundRoutingDialogProps) {
    const { open, onClose, pea, gameConfig, selectedGame, fiatConverter } = props

    const routing = computeFundRouting(pea, gameConfig)
    const extras: { entry: FundRoutingEntry, label: string, caption: string }[] = []
    if (routing.nextPot) {
        extras.push({
            entry: routing.nextPot,
            label: routing.nextPot.label,
            caption: 'Held back to seed the next jackpot once this one is won.',
        })
    }
    if (routing.parentGame) {
        const label = parentLabel(selectedGame, routing.parentGame.label)
        extras.push({
            entry: routing.parentGame,
            label,
            caption: `Forwarded to the ${label}, this game's parent pool.`,
        })
    }

    return <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='lg:min-w-[576px]' showCloseButton={false} containerContentClassName='p-6'>
            <DialogHeader className='flex flex-row justify-between'>
                <HStack className='gap-4 items-center justify-between w-full'>
                    <DialogTitle className='uppercase heading-xl font-normal h-auto'>Where your funds go</DialogTitle>
                    <Button variant='ghost' size='icon' className='size-6 p-0' onClick={onClose}>
                        <XIcon className='size-6' />
                    </Button>
                </HStack>
            </DialogHeader>
            <VStack className='pt-6 gap-6'>
                <p className='text-foreground/80'>
                    Your entry funds the prize pool — but not all of it lands in the jackpot. Here&apos;s exactly where this
                    entry&apos;s <strong>{formatEtherMaxDecimalsGreedy(pea, 6)} ETH</strong> is routed.
                </p>

                <VStack className='gap-2'>
                    <h3 className='font-bold'>Current game prize pots</h3>
                    <Table className='after:content-[""] after:absolute after:inset-0 after:border after:border-gray-700 after:rounded-lg [&_tr]:border-gray-700'>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='pl-4'>Prize</TableHead>
                                <TableHead>Share</TableHead>
                                <TableHead className='pr-4'>Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {routing.tiers.map((tier, index) => (
                                <TableRow key={index}>
                                    <TableCell className='pl-4'>
                                        <PrizeBadge ordinal={index + 1} className='bg-[#181B31]'>
                                            {tier.label}
                                        </PrizeBadge>
                                    </TableCell>
                                    <TableCell>{percentLabel(tier)}</TableCell>
                                    <TableCell className='pr-4'>
                                        <AmountCell amount={tier.amount} fiatConverter={fiatConverter} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </VStack>

                {extras.length > 0 && (
                    <VStack className='gap-2'>
                        <h3 className='font-bold'>Routed elsewhere</h3>
                        <VStack className='gap-3'>
                            {extras.map(({ entry, label, caption }) => (
                                <HStack key={label} className='justify-between items-start gap-4 bg-gray-950 rounded-sm p-4'>
                                    <VStack className='gap-1'>
                                        <HStack className='gap-2 items-center'>
                                            <span className='font-medium'>{label}</span>
                                            <span className='text-sm text-secondary-foreground'>{percentLabel(entry)}</span>
                                        </HStack>
                                        <span className='text-sm text-secondary-foreground'>{caption}</span>
                                    </VStack>
                                    <AmountCell amount={entry.amount} fiatConverter={fiatConverter} />
                                </HStack>
                            ))}
                        </VStack>
                    </VStack>
                )}
            </VStack>
        </DialogContent>
    </Dialog>
}

export type FundRoutingDialogProps = {
    open: boolean
    onClose: () => void
    pea: bigint
    gameConfig: GameConfig
    selectedGame: GameType
}

export default function FundRoutingDialog(props: FundRoutingDialogProps) {
    const { open, onClose, pea, gameConfig, selectedGame } = props
    // 4 fiat decimals to match the EntrySummary breakdown — these routing
    // amounts are fractions of a cent, so $0/$1 rounding hides the real values.
    const fiatConverter = useFiatConverter({ maxDecimals: 4 })

    return <_FundRoutingDialog
        open={open}
        onClose={onClose}
        pea={pea}
        gameConfig={gameConfig}
        selectedGame={selectedGame}
        fiatConverter={fiatConverter}
    />
}
