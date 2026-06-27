import { Address } from 'viem'
import useSelfExclusion, {
    SelfExclusionRecord,
} from '@/hooks/responsible-gaming/useSelfExclusion'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import usePlayerActivityState from '@/hooks/player-summary/usePlayerActivityState'
import usePlayerBalances from '@/hooks/contracts/lgo/usePlayerBalances'
import { ZERO_ADDRESS } from '@/web3/constants'
import { durationLabel, formatEndsAt } from './selfExclusionCopy'

export type SelfExclusionBannerViewProps = {
    record: SelfExclusionRecord | null
    hasClaimableWinnings: boolean
}

export function SelfExclusionBannerView({
    record,
    hasClaimableWinnings,
}: SelfExclusionBannerViewProps) {
    if (!record) return null
    const isPermanent = record.duration === 'permanent' || !record.endsAt
    const summary = isPermanent
        ? 'You are self-excluded permanently.'
        : `You are self-excluded until ${formatEndsAt(record.endsAt)} (${durationLabel(record.duration)}).`

    return (
        <div
            role='alert'
            className='w-full bg-destructive text-destructive-foreground text-sm py-2 px-4 text-center'
        >
            <strong className='mr-2'>Self-exclusion active:</strong>
            {summary}
            {hasClaimableWinnings && ' You can still claim any escrowed winnings during this period.'}
            {' '}See the Responsible gaming page for details.
        </div>
    )
}

export default function SelfExclusionBanner() {
    const { active } = useSelfExclusion()
    const address = useAccountAddress()
    const { state } = usePlayerActivityState()
    const { eth, weth } = usePlayerBalances(
        address === ZERO_ADDRESS ? ZERO_ADDRESS : (address as Address),
    )
    const hasClaimableWinnings = (
        (state?.pendingClaimEurMinor ?? 0) > 0
        || eth > 0n
        || weth > 0n
    )
    return <SelfExclusionBannerView record={active} hasClaimableWinnings={hasClaimableWinnings} />
}
