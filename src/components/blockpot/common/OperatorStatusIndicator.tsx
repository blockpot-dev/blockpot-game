import { useAccount } from 'wagmi'
import useIsLGOWhitelisted from '@/hooks/contracts/compliance-registry/useIsLGOWhitelisted'
import usePlayerRegistration from '@/hooks/contracts/player-registry/usePlayerRegistration'
import usePlayerStatus, { PlayerStatus } from '@/hooks/contracts/player-registry/usePlayerStatus'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ZERO_ADDRESS } from '@/web3/constants'
import { cn } from '@/lib/utils'

type State =
    | 'loading'
    | 'not-whitelisted'
    | 'wallet-disconnected'
    | 'blocked'
    | 'not-registered'
    | 'registering'
    | 'registration-failed'
    | 'connected'

const STATE_STYLES: Record<State, { dot: string, label: string, tooltip: string }> = {
    loading: {
        dot: 'bg-muted-foreground animate-pulse',
        label: 'Connecting',
        tooltip: 'Checking operator and wallet status…',
    },
    'not-whitelisted': {
        dot: 'bg-destructive',
        label: 'Site unavailable',
        tooltip: 'The operator is not whitelisted in ComplianceRegistry. Entries are disabled site-wide until it is approved.',
    },
    'wallet-disconnected': {
        dot: 'bg-muted-foreground',
        label: 'Wallet disconnected',
        tooltip: 'Connect your wallet to view your account status and enter draws.',
    },
    blocked: {
        dot: 'bg-destructive',
        label: 'Blocked',
        tooltip: 'This wallet is suspended or banned by the operator. Contact support to resolve.',
    },
    'not-registered': {
        dot: 'bg-warning',
        label: 'Not registered',
        tooltip: 'Your wallet is connected but not yet registered as a player. Click Register in the entry panel to finish onboarding.',
    },
    registering: {
        dot: 'bg-warning animate-pulse',
        label: 'Registering…',
        tooltip: 'Registration transaction submitted. Waiting for on-chain confirmation.',
    },
    'registration-failed': {
        dot: 'bg-destructive',
        label: 'Registration failed',
        tooltip: 'The last registration attempt failed. Click Try again in the entry panel.',
    },
    connected: {
        dot: 'animate-pulse-positive',
        label: 'Ready',
        tooltip: 'Your wallet is registered and the operator is active. Draws are open.',
    },
}

export function OperatorStatusIndicator() {
    const { address, isConnected } = useAccount()
    const { isWhitelisted, isLoading: isWhitelistLoading } = useIsLGOWhitelisted()
    const {
        isActive,
        isActiveLoading,
        isPending: isRegistrationPending,
        isFailed: isRegistrationFailed,
    } = usePlayerRegistration()
    const { status: playerStatus, isLoading: isPlayerStatusLoading } = usePlayerStatus(address ?? ZERO_ADDRESS)

    let state: State
    if (isWhitelistLoading || (isConnected && (isActiveLoading || isPlayerStatusLoading))) {
        state = 'loading'
    } else if (!isWhitelisted) {
        state = 'not-whitelisted'
    } else if (!isConnected) {
        state = 'wallet-disconnected'
    } else if (isConnected && (playerStatus === PlayerStatus.SUSPENDED || playerStatus === PlayerStatus.BANNED)) {
        state = 'blocked'
    } else if (isConnected && !isActive) {
        if (isRegistrationPending) state = 'registering'
        else if (isRegistrationFailed) state = 'registration-failed'
        else state = 'not-registered'
    } else {
        state = 'connected'
    }

    const styles = STATE_STYLES[state]

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type='button'
                    aria-label={styles.tooltip}
                    className='flex items-center gap-2 h-[40px] px-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                >
                    <span
                        className={cn(
                            'inline-block h-2 w-2 rounded-full',
                            styles.dot,
                        )}
                    />
                    <span className='text-xs font-medium text-secondary-foreground'>
                        {styles.label}
                    </span>
                </button>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='max-w-[240px] bg-gray-800 text-xs'>
                {styles.tooltip}
            </TooltipContent>
        </Tooltip>
    )
}
