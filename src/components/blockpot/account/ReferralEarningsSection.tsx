import { Button } from '@blockpot-dev/blockpot-design-system'
import { formatEther } from 'viem'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import useReferrerDashboard, { ReferrerDashboardRecord } from '@/hooks/referral/useReferrerDashboard'

import { SUPPORT_LINK_LABEL, SUPPORT_URL } from '@/constants/support'

const STATUS_COPY: Record<'suspended' | 'terminated', string> = {
    suspended: 'Your referral rewards are paused.',
    terminated: 'Your referral rewards have ended.',
}

const supportLink = (
    <a href={SUPPORT_URL} target='_blank' rel='noopener noreferrer' className='underline underline-offset-2'>
        {SUPPORT_LINK_LABEL}
    </a>
)

export type ReferralEarningsViewProps = {
    record: ReferrerDashboardRecord
    onClaim: () => void
    isClaiming: boolean
}

/** Props-driven view (storybook target). */
export function ReferralEarningsView({ record, onClaim, isClaiming }: ReferralEarningsViewProps) {
    const canClaim = record.status === 'active' && record.accrued > 0n && !isClaiming

    return (
        <VStack className="gap-2 rounded-md border border-border p-3">
            <HStack className="items-center justify-between">
                <span className="text-sm font-semibold">Referral rewards</span>
            </HStack>
            <HStack className="items-center justify-between text-sm">
                <span>Available to claim: {formatEther(record.accrued)} ETH</span>
                <span className="text-xs text-muted-foreground">
                    Received so far: {formatEther(record.lifetimeEarned)} ETH
                </span>
            </HStack>
            {record.status !== 'active' && (
                <p className="text-xs text-amber-600">{STATUS_COPY[record.status]} {supportLink} if you have questions.</p>
            )}
            <Button disabled={!canClaim} onClick={onClaim}>
                {isClaiming ? 'Claiming…' : 'Claim rewards'}
            </Button>
        </VStack>
    )
}

/**
 * Minimal referrer dashboard inside the account dialog, rendered only for wallets the
 * operator has registered as referrers. Claiming requires Active status and a clean
 * sanctions screen on-chain; contract rejections surface through the tracked-write toasts.
 */
export default function ReferralEarningsSection() {
    const { record, isLoading, isError, refetch, claim, isClaiming } = useReferrerDashboard()
    if (isLoading) {
        return (
            <p className='text-xs text-secondary-foreground' aria-live='polite'>Loading referral rewards…</p>
        )
    }
    if (isError) {
        return (
            <HStack className='gap-3 items-center rounded-md border border-border p-3'>
                <span className='text-xs text-destructive' role='alert'>We couldn&apos;t load your referral rewards.</span>
                <Button size='sm' variant='secondary' onClick={() => { void refetch() }}>Retry</Button>
            </HStack>
        )
    }
    if (!record) return null
    return <ReferralEarningsView record={record} onClaim={() => void claim()} isClaiming={isClaiming} />
}
