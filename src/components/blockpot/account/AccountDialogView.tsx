import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@blockpot-dev/blockpot-design-system'
import { XIcon } from 'lucide-react'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClaimDecision } from '@/hooks/claim/types'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'
import AccountDialogWalletSection from './AccountDialogWalletSection'
import AccountDialogWalletTab from './AccountDialogWalletTab'
import AccountDialogVerificationTab from './AccountDialogVerificationTab'

export type AccountDialogViewProps = {
    open: boolean
    onOpenChange: (open: boolean) => void

    state: PlayerActivityState | undefined
    /** True while the activity state is still being read. */
    stateLoading?: boolean
    /** Refetches the account state after a failed load. */
    onRetryState?: () => void

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
        state, stateLoading, onRetryState,
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
                        <DialogTitle className='uppercase heading-xl font-normal h-auto'>Your account</DialogTitle>
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
                                    <AccountDialogVerificationTab onVerify={onVerify} />
                                </TabsContent>
                            </Tabs>
                        )
                        : (
                            <>
                                <AccountDialogWalletSection onAfterDisconnect={() => onOpenChange(false)} />
                                {stateLoading
                                    ? (
                                        <span className='text-sm text-secondary-foreground' aria-live='polite'>
                                            Loading your account…
                                        </span>
                                    )
                                    : (
                                        <HStack className='gap-3 items-center flex-wrap'>
                                            <span className='text-sm text-secondary-foreground' role='alert'>
                                                We couldn&apos;t load your account.
                                            </span>
                                            {onRetryState && (
                                                <Button size='sm' variant='secondary' onClick={onRetryState}>
                                                    Retry
                                                </Button>
                                            )}
                                        </HStack>
                                    )}
                            </>
                        )}
                </VStack>
            </DialogContent>
        </Dialog>
    )
}
