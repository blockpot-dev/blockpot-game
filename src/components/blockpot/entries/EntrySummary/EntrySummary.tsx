import { useState } from 'react'
import { InfoIcon } from 'lucide-react'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import Token from '@/components/core/Token/Token'
import { Amounts } from '@/types/draw/tokens'
import { GameConfig } from '@/types/draw/config'
import { GameType } from '@/providers/SelectedGameProvider'
import { useFundRoutingDialogOpen } from '@/providers/ModalOpenStateProvider'
import FundRoutingDialog from '../../modals/FundRoutingDialog/FundRoutingDialog'

export type EntrySummaryProps = {
    pea: Amounts
    cf: Amounts
    of: Amounts
    total: Amounts
    baseBalance: string
    cfBasisPoints: bigint
    ofBasisPoints: bigint
    basisPointsDivisor: bigint
    gameConfig: GameConfig
    selectedGame: GameType
};

function bpsToPercent(bps: bigint, divisor: bigint): string {
    const percent = Number(bps * 10000n / divisor) / 100
    return `${percent.toFixed(percent % 1 === 0 ? 0 : 2)}%`
}

function BreakdownRow({ label, amount, onClick }: { label: string, amount: Amounts, onClick?: () => void }) {
    const interactive = onClick !== undefined
    const Tag = interactive ? 'button' : 'div'
    return (
        <Tag
            type={interactive ? 'button' : undefined}
            onClick={onClick}
            className={`w-full flex justify-between items-center bg-secondary border border-border rounded-sm px-2.5 py-1 text-left${interactive ? ' cursor-pointer hover:border-secondary-foreground/50 transition-colors' : ''}`}
        >
            <span className='flex items-center gap-1 text-xs text-secondary-foreground'>
                {label}
                {interactive && <InfoIcon className='size-3' aria-label='See where these funds go' />}
            </span>
            <div className='flex flex-col items-end leading-tight'>
                <span className='text-xs font-bold text-foreground'>
                    {amount.amountFormatted} <span className='font-normal text-secondary-foreground'>{amount.nativeToken}</span>
                </span>
                <span className='text-[10px] text-secondary-foreground'>{amount.fiatFormatted}</span>
            </div>
        </Tag>
    )
}

function OperatorDivider({ symbol }: { symbol: '+' | '=' }) {
    return (
        <div className='flex items-center justify-center text-secondary-foreground text-xs leading-none select-none py-1.5'>
            {symbol}
        </div>
    )
}

export default function EntrySummary(props: EntrySummaryProps) {
    const { pea, cf, of, total, baseBalance, cfBasisPoints, ofBasisPoints, basisPointsDivisor, gameConfig, selectedGame } = props
    const [expanded, setExpanded] = useState(false)
    const fundRoutingDialogOpen = useFundRoutingDialogOpen()

    return (
        <div className='w-full'>
            <VStack className='gap-3'>
                <HStack className='justify-between items-center'>
                    <span className='text-sm text-secondary-foreground font-bold uppercase'>Summary</span>
                    <HStack className='gap-2 items-center'>
                        <span className='text-sm'>
                            <span className='text-secondary-foreground'>Balance: </span>
                            <span className='font-bold'>{baseBalance}</span>
                        </span>
                        <Token token='eth' size='lg' />
                    </HStack>
                </HStack>
                <VStack className='gap-2'>
                    <HStack className='justify-between items-center'>
                        <span className='text-sm text-secondary-foreground'>Total</span>
                        <button
                            type='button'
                            onClick={() => setExpanded(v => !v)}
                            className='text-xs text-secondary-foreground hover:text-foreground underline-offset-2 hover:underline cursor-pointer'
                        >
                            {expanded ? 'Hide breakdown' : 'Show breakdown'}
                        </button>
                    </HStack>
                    <div className='bg-background border border-border rounded-sm px-3'>
                        <HStack className='justify-between items-center h-[41px]'>
                            <HStack className='gap-2 items-center'>
                                <Token token='eth' size='lg' />
                                <span className='text-sm'>
                                    <span className='font-bold text-foreground'>{total.amountFormatted}</span>
                                    <span className='text-secondary-foreground'> {total.nativeToken}</span>
                                </span>
                            </HStack>
                            <span className='text-sm text-foreground'>{total.fiatFormatted}</span>
                        </HStack>
                        <div
                            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                            aria-hidden={!expanded}
                        >
                            <div className='overflow-hidden'>
                                <div className='border-t border-border -mx-3' />
                                <div className='py-4'>
                                    <BreakdownRow label='Prize pool' amount={pea} onClick={() => fundRoutingDialogOpen.update(true)} />
                                    <OperatorDivider symbol='+' />
                                    <BreakdownRow label={`Unipot Protocol fee (${bpsToPercent(cfBasisPoints, basisPointsDivisor)})`} amount={cf} />
                                    {ofBasisPoints > 0n && (
                                        <>
                                            <OperatorDivider symbol='+' />
                                            <BreakdownRow label={`Blockpot fee (${bpsToPercent(ofBasisPoints, basisPointsDivisor)})`} amount={of} />
                                        </>
                                    )}
                                    <OperatorDivider symbol='=' />
                                    <BreakdownRow label='Total' amount={total} />
                                </div>
                            </div>
                        </div>
                    </div>
                </VStack>
            </VStack>
            <FundRoutingDialog
                open={fundRoutingDialogOpen.value}
                onClose={() => fundRoutingDialogOpen.update(false)}
                pea={pea.amount}
                gameConfig={gameConfig}
                selectedGame={selectedGame}
            />
        </div>
    )
}
