import { Loader2, CheckCircle2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@blockpot-dev/blockpot-design-system'
import { Address } from 'viem'
import VStack from '@/components/core/VStack/VStack'
import usePlayerKyc, { KycTier, PlayerKycStatus } from '@/hooks/player/usePlayerKyc'
import useKycTier from '@/hooks/contracts/kyc-registry/useKycTier'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { ZERO_ADDRESS } from '@/web3/constants'
import AgeRejectionBanner from './AgeRejectionBanner'
import PendingCddBanner from './PendingCddBanner'
import SumsubSdkHost from './SumsubSdkHost'

const TIER_BY_ORDINAL: KycTier[] = ['T0', 'T1', 'T2', 'T3', 'T4']

function tierIndex(tier: KycTier): number {
    return TIER_BY_ORDINAL.indexOf(tier)
}

function tierFromOrdinal(ordinal: number): KycTier | undefined {
    if (ordinal < 0 || ordinal >= TIER_BY_ORDINAL.length) return undefined
    return TIER_BY_ORDINAL[ordinal]
}

export type KycVerificationContentProps = {
    targetTier: KycTier
    status: PlayerKycStatus | undefined
    onChainTier: KycTier | undefined
    onRefresh: () => void
}

// Pure view used by storybook decorators that inject status / onChainTier
// without needing a wagmi provider or a live gaming-service backend. The
// default export below wraps this with the hooks that drive prod state.
export function KycVerificationContent({
    targetTier,
    status,
    onChainTier,
    onRefresh,
}: KycVerificationContentProps) {
    const navigate = useNavigate()

    if (onChainTier !== undefined && tierIndex(onChainTier) >= tierIndex(targetTier)) {
        return (
            <VStack className='gap-3 items-start'>
                <div className='flex items-center gap-2 text-green-400'>
                    <CheckCircle2 className='size-6' />
                    <h2 className='text-xl font-semibold text-foreground'>Verification complete</h2>
                </div>
                <p className='text-sm text-gray-400'>
                    Your tier is now <span className='text-foreground font-medium'>{onChainTier}</span>. You can head back to the game.
                </p>
                {/* design-system Button always renders 3 children inside its
                    wrapper (loader + children + hover overlay), which breaks
                    Radix Slot's React.Children.only when `asChild` is true.
                    Use a plain navigation handler instead. */}
                <Button size='default' onClick={() => { void navigate({ to: '/play' }) }}>
                    BACK TO PLAY
                </Button>
            </VStack>
        )
    }

    return (
        <VStack className='gap-6'>
            <AgeRejectionBanner status={status} />
            <PendingCddBanner status={status} />
            <SumsubSdkHost targetTier={targetTier} onComplete={onRefresh} />
        </VStack>
    )
}

export type KycVerificationViewProps = {
    targetTier: KycTier
}

export default function KycVerificationView({ targetTier }: KycVerificationViewProps) {
    const { status, isLoading, error, refresh } = usePlayerKyc()
    const address = useAccountAddress()
    const { tier: chainTierOrdinal, isLoading: tierLoading } = useKycTier(address as Address)
    const onChainTier: KycTier | undefined = !tierLoading && address !== ZERO_ADDRESS
        ? tierFromOrdinal(chainTierOrdinal)
        : undefined

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-[320px]'>
                <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
            </div>
        )
    }

    if (error) {
        return (
            <VStack className='gap-3'>
                <p className='text-sm text-destructive'>
                    We couldn&apos;t load your verification status. Try again in a moment.
                </p>
                <Button variant='secondary' size='default' onClick={() => refresh()}>
                    RETRY
                </Button>
            </VStack>
        )
    }

    return (
        <KycVerificationContent
            targetTier={targetTier}
            status={status}
            onChainTier={onChainTier}
            onRefresh={refresh}
        />
    )
}
