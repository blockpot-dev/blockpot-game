import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@blockpot-dev/blockpot-design-system'
import { XIcon } from 'lucide-react'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClaimDecision } from '@/hooks/claim/types'
import { GateRecord, GateType } from '@/hooks/player/usePlayerKyc'
import { PrizePoolContext } from '@/hooks/player-summary/usePrizePoolContext'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'
import AccountDialogWalletSection from './AccountDialogWalletSection'
import AccountDialogWalletTab from './AccountDialogWalletTab'
import AccountDialogVerificationTab from './AccountDialogVerificationTab'

export type AccountDialogViewProps = {
    open: boolean
    onOpenChange: (open: boolean) => void

    state: PlayerActivityState | undefined
    draw: boolean
    prizePoolContext: PrizePoolContext | undefined
    kycGates: Partial<Record<GateType, GateRecord>> | undefined
    onChainGates: bigint

    eth: bigint
    weth: bigint
    enteredEurMinor: bigint
    wonEurMinor: bigint
    profitEurMinor: bigint
    isCompliant: boolean
    /** Cool-off end (epoch seconds); 0n = not blocked. */
    blockedUntil?: bigint

    decision: ClaimDecision | null
    isClaiming: boolean
    claimRequestPending: boolean
    opStatus: string | undefined
    opError: string | null | undefined

    onClaim: () => void
    onReleasePending: () => void
    onVerify: () => void
    onClearDecision: () => void
}

export default function AccountDialogView(props: AccountDialogViewProps) {
    const {
        open, onOpenChange,
        state, draw, prizePoolContext, kycGates, onChainGates,
        eth, weth, enteredEurMinor, wonEurMinor, profitEurMinor, isCompliant,
        blockedUntil,
        decision, isClaiming, claimRequestPending, opStatus, opError,
        onClaim, onReleasePending, onVerify, onClearDecision,
    } = props

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='lg:min-w-[560px]' showCloseButton={false} containerContentClassName='p-6 min-h-0 flex flex-col'>
                <DialogHeader className='flex flex-row justify-between'>
                    <HStack className='gap-4 items-center justify-between w-full'>
                        <DialogTitle className='uppercase heading-xl font-normal h-auto'>Your Account</DialogTitle>
                        <Button variant='ghost' size='icon' className='size-6 p-0' onClick={() => onOpenChange(false)} aria-label='Close'>
                            <XIcon className='size-6' />
                        </Button>
                    </HStack>
                </DialogHeader>
                <VStack className='pt-6 gap-6 overflow-y-auto min-h-0 pr-2 -mr-2'>
                    {state
                        ? (
                            <Tabs defaultValue='wallet' className='gap-6'>
                                <TabsList className='w-full h-10'>
                                    <TabsTrigger value='wallet' className='uppercase tracking-wide text-xs'>
                                        Wallet
                                    </TabsTrigger>
                                    <TabsTrigger value='verification' className='uppercase tracking-wide text-xs'>
                                        Verification
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value='wallet'>
                                    <AccountDialogWalletTab
                                        state={state}
                                        draw={draw}
                                        prizePoolContext={prizePoolContext}
                                        eth={eth}
                                        weth={weth}
                                        enteredEurMinor={enteredEurMinor}
                                        wonEurMinor={wonEurMinor}
                                        profitEurMinor={profitEurMinor}
                                        isCompliant={isCompliant}
                                        blockedUntil={blockedUntil}
                                        decision={decision}
                                        isClaiming={isClaiming}
                                        claimRequestPending={claimRequestPending}
                                        opStatus={opStatus}
                                        opError={opError}
                                        onClaim={onClaim}
                                        onReleasePending={onReleasePending}
                                        onVerify={onVerify}
                                        onClearDecision={onClearDecision}
                                        onAfterDisconnect={() => onOpenChange(false)}
                                    />
                                </TabsContent>
                                <TabsContent value='verification'>
                                    <AccountDialogVerificationTab
                                        state={state}
                                        kycGates={kycGates}
                                        onChainGates={onChainGates}
                                        onVerify={onVerify}
                                    />
                                </TabsContent>
                            </Tabs>
                        )
                        : (
                            <>
                                <AccountDialogWalletSection onAfterDisconnect={() => onOpenChange(false)} />
                                <span className='text-sm text-secondary-foreground'>
                                    Player status will appear once your wallet is connected.
                                </span>
                            </>
                        )}
                </VStack>
            </DialogContent>
        </Dialog>
    )
}
