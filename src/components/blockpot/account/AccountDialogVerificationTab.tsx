import VStack from '@/components/core/VStack/VStack'
import { GateRecord, GateType } from '@/hooks/player/usePlayerKyc'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'
import TierBreakdown from '@/components/blockpot/tier/TierBreakdown'
import TierUpgradePrompt from '@/components/blockpot/tier/TierUpgradePrompt'
import PendingCddBanner from '@/components/blockpot/tier/PendingCddBanner'

export type AccountDialogVerificationTabProps = {
    state: PlayerActivityState
    kycGates: Partial<Record<GateType, GateRecord>> | undefined
    onChainGates: bigint
    onVerify: () => void
}

export default function AccountDialogVerificationTab(props: AccountDialogVerificationTabProps) {
    const { state, kycGates, onChainGates, onVerify } = props

    return (
        <VStack className='gap-6'>
            <TierBreakdown
                gates={kycGates}
                onChainGates={onChainGates}
                nextTier={state.nextTier}
                onVerify={onVerify}
            />
            <span className='text-sm text-secondary-foreground'>
                Some prizes need identity verification before you can claim them.
            </span>
            <VStack className='gap-3'>
                <TierUpgradePrompt state={state} onVerify={onVerify} />
                <PendingCddBanner state={state} onVerify={onVerify} />
            </VStack>
        </VStack>
    )
}
