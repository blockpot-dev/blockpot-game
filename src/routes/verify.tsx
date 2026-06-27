import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Container } from '@blockpot-dev/block-pot-design-system'
import VStack from '@/components/core/VStack/VStack'
import KycVerificationView from '@/components/kyc/KycVerificationView'
import type { KycTier } from '@/hooks/player/usePlayerKyc'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useSiweSignature from '@/hooks/contracts/player-registry/useSiweSignature'
import { usePlayerSession } from '@/providers/PlayerSessionProvider'
import { ZERO_ADDRESS } from '@/web3/constants'

type VerifySearch = {
    tier?: KycTier
    returnTo?: string
}

const VALID_TIERS: KycTier[] = ['T0', 'T1', 'T2', 'T3', 'T4']
// Whitelist for `returnTo` so a malicious referrer can't bounce the player to
// an arbitrary URL after verification.
const VALID_RETURN_TO = ['/play']

export const Route = createFileRoute('/verify')({
    component: VerifyPage,
    validateSearch: (search: Record<string, unknown>): VerifySearch => {
        const rawTier = typeof search.tier === 'string' ? (search.tier as KycTier) : undefined
        const rawReturnTo = typeof search.returnTo === 'string' ? search.returnTo : undefined
        return {
            tier: rawTier && VALID_TIERS.includes(rawTier) ? rawTier : undefined,
            returnTo: rawReturnTo && VALID_RETURN_TO.includes(rawReturnTo) ? rawReturnTo : undefined,
        }
    },
})

function VerifyPage() {
    const { tier, returnTo } = Route.useSearch()
    const targetTier: KycTier = tier && tier !== 'T0' ? tier : 'T1'

    return (
        <div className='@container w-full flex-1'>
            <div className='@min-xs:max-w-[820px] mx-auto my-8 px-4'>
                <Container highlight highlightBottomBorderHidden>
                    <VStack className='gap-6'>
                        <div>
                            <h1 className='heading-4xl text-foreground'>Verify your account</h1>
                            <p className='text-sm text-secondary-foreground mt-2'>
                                Reach Tier {targetTier.slice(1)}.
                            </p>
                            {returnTo && (
                                <Link
                                    to={returnTo}
                                    className='inline-block mt-3 text-xs text-secondary-foreground underline hover:text-foreground'
                                >
                                    ← Back to {returnTo.replace('/', '')}
                                </Link>
                            )}
                        </div>
                        <SessionGate targetTier={targetTier} />
                    </VStack>
                </Container>
            </div>
        </div>
    )
}

// `/verify` can be reached by direct URL navigation (e.g. tier-upgrade prompt
// in a fresh tab), so we cannot assume onboarding has already minted a Bearer
// token. Short-circuit on no wallet, then gate on no SIWE session before
// mounting the verification view. Once `setSession` fires, `usePlayerSession`
// re-renders and the view takes over.
function SessionGate({ targetTier }: { targetTier: KycTier }) {
    const address = useAccountAddress()
    const { session } = usePlayerSession()
    const siwe = useSiweSignature()

    if (address === ZERO_ADDRESS) {
        return (
            <p className='text-sm text-secondary-foreground'>
                Connect your wallet to start verification.
            </p>
        )
    }

    if (!session) {
        const errorMessage = siwe.isError
            ? siwe.error instanceof Error ? siwe.error.message : 'Sign-in failed.'
            : null
        return (
            <VStack className='gap-3 items-start'>
                <p className='text-sm text-secondary-foreground'>
                    Sign in with your wallet to continue verification. Your wallet
                    will prompt you to sign a short message — no transaction or
                    gas required.
                </p>
                {errorMessage && (
                    <p className='text-sm text-destructive'>{errorMessage}</p>
                )}
                <Button
                    onClick={() => siwe.mutate({ address })}
                    disabled={siwe.isPending}
                >
                    {siwe.isPending ? 'SIGNING…' : 'SIGN IN'}
                </Button>
            </VStack>
        )
    }

    return <KycVerificationView targetTier={targetTier} />
}
