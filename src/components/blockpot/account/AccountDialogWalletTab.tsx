import { Button } from '@blockpot-dev/blockpot-design-system'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { ClaimDecision } from '@/hooks/claim/types'
import { PrizePoolContext } from '@/hooks/player-summary/usePrizePoolContext'
import { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'
import { formatEtherMaxDecimals } from '@/utilities/formatters'
import LifetimeStatsRow from '@/components/blockpot/winnings/LifetimeStatsRow'
import ClaimDecisionView from '@/components/blockpot/winnings/ClaimDecision'
import PrizePoolPreCommitBanner from '@/components/blockpot/tier/PrizePoolPreCommitBanner'
import CoolOffStatusBanner from '@/components/responsible-gaming/CoolOffStatusBanner'
import AccountDialogWalletSection from './AccountDialogWalletSection'
import ReferralEarningsSection from './ReferralEarningsSection'

export type AccountDialogWalletTabProps = {
    state: PlayerActivityState
    draw: boolean
    prizePoolContext: PrizePoolContext | undefined

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
    onAfterDisconnect: () => void
}

function formatEur(minor: number): string {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
    }).format(minor / 100)
}

export default function AccountDialogWalletTab(props: AccountDialogWalletTabProps) {
    const {
        state, draw, prizePoolContext,
        eth, weth, enteredEurMinor, wonEurMinor, profitEurMinor, isCompliant,
        blockedUntil,
        decision, isClaiming, claimRequestPending, opStatus, opError,
        onClaim, onReleasePending, onVerify, onClearDecision, onAfterDisconnect,
    } = props

    const pendingClaimEurMinor = state.pendingClaimEurMinor ?? 0
    const summaryCurrentTier = state.currentTier ?? 'T0'
    const hasPendingClaim = pendingClaimEurMinor > 0

    const allClaimable = !hasPendingClaim && (eth > 0n || weth > 0n) && isCompliant
    const capSplit = hasPendingClaim && summaryCurrentTier === 'T0'
    const postT1Release = hasPendingClaim && summaryCurrentTier !== 'T0'

    const opPending = !!opStatus && !['CONFIRMED', 'REVERTED', 'FAILED'].includes(opStatus)
    const opTerminal = !!opStatus && ['CONFIRMED', 'REVERTED', 'FAILED'].includes(opStatus)

    return (
        <VStack className='gap-6'>
            <AccountDialogWalletSection onAfterDisconnect={onAfterDisconnect} />
            <ReferralEarningsSection />
            <CoolOffStatusBanner blockedUntil={blockedUntil ?? 0n} />
            <LifetimeStatsRow
                enteredEurMinor={enteredEurMinor}
                wonEurMinor={wonEurMinor}
                profitEurMinor={profitEurMinor}
            />

            <VStack className='gap-3'>
                {allClaimable && (
                    <VStack className='gap-3'>
                        <VStack className='gap-1'>
                            <span className='text-xs uppercase text-secondary-foreground'>Available to claim</span>
                            <span className='text-sm font-semibold'>
                                {formatEtherMaxDecimals(eth, 4)} <span className='text-secondary-foreground font-normal'>ETH</span>
                            </span>
                            {weth > 0n && (
                                <span className='text-sm font-semibold'>
                                    {formatEtherMaxDecimals(weth, 4)} <span className='text-secondary-foreground font-normal'>WETH</span>
                                </span>
                            )}
                        </VStack>
                        <Button
                            onClick={onClaim}
                            disabled={isClaiming || claimRequestPending || opPending}
                        >
                            {isClaiming || claimRequestPending ? 'CLAIMING…' : 'CLAIM'}
                        </Button>
                    </VStack>
                )}

                {capSplit && (
                    <VStack className='gap-3'>
                        <VStack className='gap-1'>
                            <span className='text-xs uppercase text-secondary-foreground'>Available now</span>
                            <span className='text-sm font-semibold'>
                                {formatEtherMaxDecimals(eth, 4)} <span className='text-secondary-foreground font-normal'>ETH</span>
                                {weth > 0n && (
                                    <> + {formatEtherMaxDecimals(weth, 4)} <span className='text-secondary-foreground font-normal'>WETH</span></>
                                )}
                            </span>
                        </VStack>
                        <VStack className='gap-1'>
                            <span className='text-xs uppercase text-secondary-foreground'>Held until verification</span>
                            <span className='text-sm font-semibold'>{formatEur(pendingClaimEurMinor)}</span>
                        </VStack>
                        <HStack className='gap-2 flex-wrap'>
                            <Button
                                onClick={onClaim}
                                disabled={isClaiming || claimRequestPending || opPending || (eth === 0n && weth === 0n)}
                            >
                                {isClaiming || claimRequestPending ? 'CLAIMING…' : 'CLAIM AVAILABLE'}
                            </Button>
                            <Button variant='secondary' onClick={onVerify}>
                                Verify to unlock {formatEur(pendingClaimEurMinor)}
                            </Button>
                        </HStack>
                    </VStack>
                )}

                {postT1Release && (
                    <VStack className='gap-3'>
                        <VStack className='gap-1'>
                            <span className='text-xs uppercase text-secondary-foreground'>Available to release</span>
                            <span className='text-sm font-semibold'>{formatEur(pendingClaimEurMinor)}</span>
                        </VStack>
                        <Button
                            onClick={onReleasePending}
                            disabled={isClaiming || claimRequestPending || opPending || (eth === 0n && weth === 0n)}
                        >
                            {isClaiming || claimRequestPending ? 'RELEASING…' : `Release ${formatEur(pendingClaimEurMinor)}`}
                        </Button>
                    </VStack>
                )}

                {decision && !decision.allow && (
                    <ClaimDecisionView
                        decision={decision}
                        onClose={onClearDecision}
                        onVerify={() => { onClearDecision(); onVerify() }}
                        onRetry={onClaim}
                    />
                )}

                {(opPending || opTerminal) && (
                    <div className='border-t border-border pt-3'>
                        {opPending && (
                            <p className='text-xs text-secondary-foreground'>
                                Operation in progress: {opStatus ?? 'PENDING'}
                            </p>
                        )}
                        {opStatus === 'CONFIRMED' && (
                            <p className='text-xs text-positive'>Claim confirmed.</p>
                        )}
                        {opTerminal && (opStatus === 'REVERTED' || opStatus === 'FAILED') && (
                            <p className='text-xs text-destructive'>
                                Claim failed{opError ? `: ${opError}` : '.'}
                            </p>
                        )}
                    </div>
                )}
            </VStack>

            {!draw && (
                <PrizePoolPreCommitBanner
                    state={state}
                    context={prizePoolContext}
                    onVerify={onVerify}
                />
            )}
        </VStack>
    )
}
