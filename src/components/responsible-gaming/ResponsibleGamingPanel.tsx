import { Button, Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useSiweSignature from '@/hooks/contracts/player-registry/useSiweSignature'
import { usePlayerSession } from '@/providers/PlayerSessionProvider'
import { ZERO_ADDRESS } from '@/web3/constants'
import SelfExclusionPanel from './SelfExclusionPanel'
import LossLimitsPanel from './LossLimitsPanel'
import ProblemGamblingResources from './ProblemGamblingResources'

export type ResponsibleGamingPanelProps = {
    className?: string
}

export default function ResponsibleGamingPanel({ className }: ResponsibleGamingPanelProps) {
    return (
        <div className={`@container w-full ${className ?? ''}`.trim()}>
            <div className='@min-xs:max-w-[820px] mx-auto my-8 px-4'>
                <Container highlight highlightBottomBorderHidden>
                    <VStack className='gap-8'>
                        <div>
                            <h1 className='heading-4xl text-foreground'>Responsible gaming</h1>
                            <p className='text-sm text-secondary-foreground mt-2 max-w-2xl'>
                                Tools and resources to help you stay in control. Self-exclusion and
                                loss limits are enforced by our compliance gate before every wager.
                            </p>
                        </div>

                        <GatedSettings />

                        <PrivacyAndDataNotice />

                        <ProblemGamblingResources />
                    </VStack>
                </Container>
            </div>
        </div>
    )
}

// `/responsible-gaming` can be reached by direct URL navigation, so we cannot
// assume onboarding already minted a Bearer token. Mirror the /verify pattern:
// short-circuit on no wallet, then gate on no SIWE session before mounting the
// settings panels. Without the session gate, the loss-limits queries would
// stay disabled (they require activeToken()), leaving the panels stuck on
// "Loading…" with no fetch and no error.
function GatedSettings() {
    const address = useAccountAddress()
    const { session } = usePlayerSession()
    const siwe = useSiweSignature()

    if (address === ZERO_ADDRESS) {
        return (
            <p className='text-sm text-secondary-foreground'>
                Connect your wallet to manage your responsible-gaming settings.
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
                    Sign in with your wallet to manage your responsible-gaming
                    settings. Your wallet will prompt you to sign a short message —
                    no transaction or gas required.
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

    return (
        <>
            <SelfExclusionPanel walletConnected />
            <LossLimitsPanel walletConnected />
        </>
    )
}

// Sybil-correlation disclosure (gaming-service task 26). The TOS body returned
// by /v1/tos/current carries the binding legal text; this in-app paragraph
// keeps the same disclosure visible on the responsible-gaming surface so a
// player who has already accepted the TOS still has a place to read it
// without re-onboarding.
function PrivacyAndDataNotice() {
    return (
        <VStack className='gap-2'>
            <h2 className='heading-xl text-foreground'>Privacy &amp; data we collect</h2>
            <p className='text-sm text-secondary-foreground'>
                To meet our anti-money-laundering and fraud-prevention obligations, Blockpot
                collects technical signals about the device and network you use to play —
                including a hashed device fingerprint (browser, screen, fonts, hardware
                characteristics), your IP address, and basic interaction signals. These
                are used solely to detect duplicate accounts, sanctions exposure, and
                fraud patterns. We never sell or share this data, and we store the device
                fingerprint as an irreversible hash, not the underlying components. The
                full policy lives in our Terms of Service.
            </p>
        </VStack>
    )
}
