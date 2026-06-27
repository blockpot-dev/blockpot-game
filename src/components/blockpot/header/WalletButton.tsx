import { useState } from 'react'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'
import { Button } from '@blockpot-dev/block-pot-design-system'
import { Wallet } from 'lucide-react'
import { formatAccountAddress } from '@/utilities/formatters'
import { useWalletOptionsDialogOpen } from '@/providers/ModalOpenStateProvider'
import usePlayerActivityState, { PlayerActivityState, PlayerTier } from '@/hooks/player-summary/usePlayerActivityState'
import useJackpotContext, { JackpotContext } from '@/hooks/player-summary/useJackpotContext'
import { useLotteryDraw } from '@/providers/BlockpotDrawProvider'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import usePlayerBalances from '@/hooks/contracts/lgo/usePlayerBalances'
import AccountDialog from '@/components/blockpot/account/AccountDialog'
import { cn } from '@/lib/utils'

const TIER_ORDER: PlayerTier[] = ['T0', 'T1', 'T2', 'T3', 'T4']
const TIER_WARN_RATIO = 0.8

function tierIndex(tier: PlayerTier): number {
    return TIER_ORDER.indexOf(tier)
}

function needsAttention(
    state: PlayerActivityState | undefined,
    jackpot: JackpotContext | undefined,
    drawActive: boolean,
    eth: bigint | undefined,
    weth: bigint | undefined,
): boolean {
    if ((eth ?? 0n) > 0n || (weth ?? 0n) > 0n) return true
    if (!state) return false
    if (Math.max(state.inflow.ratio, state.outflow.ratio) >= TIER_WARN_RATIO) return true
    if (state.pendingClaimEurMinor > 0) return true
    if (!drawActive && jackpot && tierIndex(jackpot.tierRequiredToFullyClaim) > tierIndex(state.currentTier)) {
        return true
    }
    return false
}

export default function WalletButton() {
    const { isConnected, address } = useAccount()
    const walletOptionsDialogOpen = useWalletOptionsDialogOpen()
    const [open, setOpen] = useState(false)

    const ensQueryOptions = { retry: false, refetchOnWindowFocus: false, refetchOnMount: false, staleTime: Infinity } as const
    const { data: ensName } = useEnsName({ address, chainId: 1, query: ensQueryOptions })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: 1, query: ensQueryOptions })

    const { state } = usePlayerActivityState()
    const { draw } = useLotteryDraw()
    const { context: jackpotContext } = useJackpotContext({ enabled: isConnected && !draw })
    const playerAddress = useAccountAddress()
    const { eth, weth } = usePlayerBalances(playerAddress)

    if (!isConnected) {
        return (
            <Button
                size='sm'
                className='h-[40px] flex items-center gap-2 justify-center rounded-sm px-3 cursor-pointer'
                onClick={() => walletOptionsDialogOpen.update(true)}
            >
                Connect Wallet
            </Button>
        )
    }

    const attention = needsAttention(state, jackpotContext, !!draw, eth, weth)
    const label = ensName ?? (address ? formatAccountAddress(address.toUpperCase()) : '')

    return (
        <>
            <Button
                variant='outline'
                size='sm'
                className='h-[40px] flex items-center gap-2 justify-center rounded-sm bg-gray-950 px-3 cursor-pointer relative'
                onClick={() => setOpen(true)}
                aria-label='Account'
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
            </Button>
            <AccountDialog open={open} onOpenChange={setOpen} />
        </>
    )
}
