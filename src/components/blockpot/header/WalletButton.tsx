import { useState } from 'react'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'
import { Button } from '@blockpot-dev/blockpot-design-system'
import { Wallet } from 'lucide-react'
import { formatAccountAddress } from '@/utilities/formatters'
import { useWalletOptionsDialogOpen } from '@/providers/ModalOpenStateProvider'
import usePlayerActivityState, { PlayerActivityState } from '@/hooks/player-summary/usePlayerActivityState'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import usePlayerBalances from '@/hooks/contracts/operator/usePlayerBalances'
import AccountDialog from '@/components/blockpot/account/AccountDialog'
import { cn } from '@/lib/utils'

// The attention dot means one thing only: there is a prize to claim
// (claimable balance or a held prize). It never fires on cap proximity —
// that would be a persistent ladder indicator (KB compliance-kyc
// "The proximity nudge": no persistent indicator).
function needsAttention(
    state: PlayerActivityState | undefined,
    eth: bigint | undefined,
    weth: bigint | undefined,
): boolean {
    if ((eth ?? 0n) > 0n || (weth ?? 0n) > 0n) return true
    if (!state) return false
    return state.pendingClaimEurMinor > 0
}

export default function WalletButton() {
    const { isConnected, address } = useAccount()
    const walletOptionsDialogOpen = useWalletOptionsDialogOpen()
    const [open, setOpen] = useState(false)

    const ensQueryOptions = { retry: false, refetchOnWindowFocus: false, refetchOnMount: false, staleTime: Infinity } as const
    const { data: ensName } = useEnsName({ address, chainId: 1, query: ensQueryOptions })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: 1, query: ensQueryOptions })

    const { state } = usePlayerActivityState()
    const playerAddress = useAccountAddress()
    const { eth, weth } = usePlayerBalances(playerAddress)

    if (!isConnected) {
        return (
            <Button
                size='sm'
                className='h-[40px] flex items-center gap-2 justify-center rounded-sm px-3 cursor-pointer'
                onClick={() => walletOptionsDialogOpen.update(true)}
            >
                Connect wallet
            </Button>
        )
    }

    const attention = needsAttention(state, eth, weth)
    const label = ensName ?? (address ? formatAccountAddress(address.toUpperCase()) : '')

    return (
        <>
            <Button
                variant='outline'
                size='sm'
                className='h-[40px] flex items-center gap-2 justify-center rounded-sm bg-gray-950 px-3 cursor-pointer relative'
                onClick={() => setOpen(true)}
                aria-label='Open your account'
            >
                {ensAvatar
                    ? <img src={ensAvatar} alt='' width={24} height={24} />
                    : <Wallet className='size-5' strokeWidth={1.5} />}
                <span className='text-foreground font-bold normal-case'>{label}</span>
                <span
                    aria-hidden
                    className={cn(
                        'absolute top-1 right-1 size-2 rounded-full bg-amber-400 transition-opacity',
                        attention ? 'opacity-100' : 'opacity-0',
                    )}
                />
                {attention && <span className='sr-only'>You have a prize to claim</span>}
            </Button>
            <AccountDialog open={open} onOpenChange={setOpen} />
        </>
    )
}
