import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import KycVerificationView from '@/components/kyc/KycVerificationView'
import type { KycTier } from '@/hooks/player/usePlayerKyc'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useSiweSignature from '@/hooks/contracts/player-registry/useSiweSignature'
import { usePlayerSession } from '@/providers/PlayerSessionProvider'
import { useWalletOptionsDialogOpen } from '@/providers/ModalOpenStateProvider'
import { ZERO_ADDRESS } from '@/web3/constants'
import { isUserRejection } from '@/web3/TransactionManager'

type VerifySearch = {
    tier?: KycTier
    returnTo?: string
}

// Tier 4 is out of scope for Phase 1 (see CLAUDE.md); T0 is never a target.
const VALID_TIERS: KycTier[] = ['T1', 'T2', 'T3']
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
    const search = Route.useSearch()
    return <VerifyPageContent {...search} />
}

// Exported for tests: the file route's component is not renderable outside
// the generated route tree.
export function VerifyPageContent({ tier, returnTo }: VerifySearch) {
    const targetTier: KycTier = tier ?? 'T1'

    return (
        <div className='@container w-full flex-1'>
            <div className='@min-xs:max-w-[820px] mx-auto my-8 px-4'>
                <Container highlight highlightBottomBorderHidden>
                    <VStack className='gap-6'>
                        <div>
                            <h1 className='heading-4xl text-foreground'>Verify your identity</h1>
                            <p className='mt-2 text-sm text-secondary-foreground'>
                                Takes a few minutes. You&apos;ll need photo ID.
                            </p>
                            {returnTo && (
                                <Link
                                    to={returnTo}
                                    className='inline-block mt-3 text-xs text-secondary-foreground underline hover:text-foreground'
                                >
                                    ← Back to Play
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
    const walletOptionsDialogOpen = useWalletOptionsDialogOpen()

    if (address === ZERO_ADDRESS) {
        return (
            <VStack className='gap-3 items-start'>
                <p className='text-sm text-secondary-foreground'>
                    Connect your wallet to verify your identity.
                </p>
                <Button onClick={() => walletOptionsDialogOpen.update(true)}>
                    Connect wallet
                </Button>
            </VStack>
        )
    }

    if (!session) {
        // Never surface the raw SIWE / wallet error to the player.
        const errorMessage = siwe.isError
            ? isUserRejection(siwe.error)
                ? 'Sign-in was cancelled. Try again.'
                : 'We couldn\'t sign you in. Check your wallet and try again.'
            : null
        return (
            <VStack className='gap-3 items-start'>
                <p className='text-sm text-secondary-foreground'>
                    Sign in with your wallet to continue. Your wallet
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
                    {siwe.isPending ? 'SIGNING…' : 'SIGN IN WITH WALLET'}
                </Button>
            </VStack>
        )
    }

    return <KycVerificationView targetTier={targetTier} />
}
