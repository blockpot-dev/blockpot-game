import VStack from '@/components/core/VStack/VStack'
import { GateRecord, GateType } from '@/hooks/player/usePlayerKyc'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'
import { TierPolicy } from '@/hooks/contracts/kyc/useActivePolicy'
import NetFlowCard from '@/components/blockpot/tier/NetFlowCard'
import TierBreakdown from '@/components/blockpot/tier/TierBreakdown'
import TierUpgradePrompt from '@/components/blockpot/tier/TierUpgradePrompt'
import PendingCddBanner from '@/components/blockpot/tier/PendingCddBanner'

export type AccountDialogVerificationTabProps = {
    state: PlayerActivityState
    kycGates: Partial<Record<GateType, GateRecord>> | undefined
    onChainGates: bigint
    tiers: readonly TierPolicy[]
    selectedTierIdx: number
    onSelectedTierChange: (idx: number) => void
    isViewingCurrentTier: boolean
    onVerify: () => void
}

export default function AccountDialogVerificationTab(props: AccountDialogVerificationTabProps) {
    const {
        state, kycGates, onChainGates, tiers,
        selectedTierIdx, onSelectedTierChange, isViewingCurrentTier, onVerify,
    } = props

    return (
        <VStack className='gap-6'>
            <NetFlowCard state={state} />
            <TierBreakdown
                currentTier={state.currentTier}
                gates={kycGates}
                onChainGates={onChainGates}
                tiers={tiers}
                selectedTierIdx={selectedTierIdx}
                onSelectedTierChange={onSelectedTierChange}
                nextTier={state.nextTier}
                onVerify={onVerify}
            />
            <span className='text-sm text-secondary-foreground'>
                Wins beyond your current tier&apos;s claim allowance are held safely
                until you complete the next verification step.
            </span>
            <VStack className='gap-3'>
                <TierUpgradePrompt state={state} onVerify={onVerify} showBanner={isViewingCurrentTier} />
                <PendingCddBanner state={state} onVerify={onVerify} />
            </VStack>
        </VStack>
    )
}
