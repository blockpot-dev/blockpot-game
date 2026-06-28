import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@blockpot-dev/blockpot-design-system'
import { XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClaimDecision } from '@/hooks/claim/types'
import { GateRecord, GateType } from '@/hooks/player/usePlayerKyc'
import { JackpotContext } from '@/hooks/player-summary/useJackpotContext'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'
import { TierPolicy } from '@/hooks/contracts/kyc/useActivePolicy'
import AccountDialogWalletSection from './AccountDialogWalletSection'
import AccountDialogWalletTab from './AccountDialogWalletTab'
import AccountDialogVerificationTab from './AccountDialogVerificationTab'

export type AccountDialogViewProps = {
    open: boolean
    onOpenChange: (open: boolean) => void

    state: PlayerActivityState | undefined
    draw: boolean
    jackpotContext: JackpotContext | undefined
    kycGates: Partial<Record<GateType, GateRecord>> | undefined
    onChainGates: bigint
    tiers: readonly TierPolicy[]

    eth: bigint
    weth: bigint
    wageredEurMinor: bigint
    wonEurMinor: bigint
    profitEurMinor: bigint
    isCompliant: boolean

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
        state, draw, jackpotContext, kycGates, onChainGates, tiers,
        eth, weth, wageredEurMinor, wonEurMinor, profitEurMinor, isCompliant,
        decision, isClaiming, claimRequestPending, opStatus, opError,
        onClaim, onReleasePending, onVerify, onClearDecision,
    } = props

    const summaryCurrentTier = state?.currentTier ?? 'T0'

    // Lift the tier-tab selection so we can decide whether the
    // claim-allowance banner should render: it duplicates TierBreakdown's
    // inline "Start verification" CTA when the user is browsing a future
    // tier, so we only show the banner while the current tier is selected.
    const tierCount = tiers.length
    const parsedCurrentIdx = parseInt(summaryCurrentTier.slice(1), 10)
    const currentTierIdx = tierCount === 0
        ? 0
        : Math.min(Math.max(parsedCurrentIdx, 0), tierCount - 1)
    const [selectedTierIdx, setSelectedTierIdx] = useState<number>(currentTierIdx)
    // Snap back when the canonical current tier changes upstream (e.g. the
    // chain emits PlayerGatesSet / TierOverrideSet while the dialog is open).
    useEffect(() => {
        setSelectedTierIdx(currentTierIdx)
    }, [currentTierIdx])
    const isViewingCurrentTier = selectedTierIdx === currentTierIdx

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='lg:min-w-[560px]' showCloseButton={false} containerContentClassName='p-6'>
                <DialogHeader className='flex flex-row justify-between'>
                    <HStack className='gap-4 items-center justify-between w-full'>
                        <DialogTitle className='uppercase heading-xl font-normal h-auto'>Your Account</DialogTitle>
                        <Button variant='ghost' size='icon' className='size-6 p-0' onClick={() => onOpenChange(false)}>
                            <XIcon className='size-6' />
                        </Button>
                    </HStack>
                </DialogHeader>
                <VStack className='pt-6 gap-6'>
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
                                        jackpotContext={jackpotContext}
                                        eth={eth}
                                        weth={weth}
                                        wageredEurMinor={wageredEurMinor}
                                        wonEurMinor={wonEurMinor}
                                        profitEurMinor={profitEurMinor}
                                        isCompliant={isCompliant}
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
                                        tiers={tiers}
                                        selectedTierIdx={selectedTierIdx}
                                        onSelectedTierChange={setSelectedTierIdx}
                                        isViewingCurrentTier={isViewingCurrentTier}
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
