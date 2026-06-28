import { Button } from '@blockpot-dev/blockpot-design-system'
import { Check, Copy, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useAccount, useBalance, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'
import { formatEtherMaxDecimalsGreedy } from '@/utilities/formatters'

export type AccountDialogWalletSectionProps = {
    onAfterDisconnect: () => void
}

export default function AccountDialogWalletSection({ onAfterDisconnect }: AccountDialogWalletSectionProps) {
    const { address, connector, chain, isConnected } = useAccount()
    const { data: ensName } = useEnsName({ address, chainId: 1 })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName ?? undefined, chainId: 1 })
    const { data: balance } = useBalance({ address })
    const { disconnect } = useDisconnect()
    const [copied, setCopied] = useState(false)

    if (!isConnected || !address) return null

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(address)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // clipboard may be unavailable in some environments — silently ignore
        }
    }

    const handleDisconnect = () => {
        disconnect()
        onAfterDisconnect()
    }

    const chainName = chain?.name
    const connectorName = connector?.name
    const balanceLine = balance ? `${formatEtherMaxDecimalsGreedy(balance.value, 4)} ${balance.symbol}` : null

    return (
        <HStack className='items-center gap-4 rounded-md border border-border bg-card/40 p-4'>
            <div className='size-10 shrink-0 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center'>
                {ensAvatar
                    ? <img src={ensAvatar} alt='' width={40} height={40} />
                    : <Wallet className='size-5' strokeWidth={1.5} />}
            </div>
            <VStack className='flex-1 min-w-0 gap-1'>
                {ensName && <span className='text-sm font-semibold'>{ensName}</span>}
                <HStack className='items-center gap-2'>
                    <span className='text-xs font-mono break-all text-secondary-foreground'>{address}</span>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='size-6 p-0 shrink-0'
                        onClick={() => { void handleCopy() }}
                        aria-label='Copy address'
                    >
                        {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
                    </Button>
                </HStack>
                {(chainName || connectorName) && (
                    <span className='text-xs text-secondary-foreground'>
                        {[chainName, connectorName].filter(Boolean).join(' · ')}
                    </span>
                )}
                {balanceLine && (
                    <span className='text-xs text-secondary-foreground'>{balanceLine}</span>
                )}
            </VStack>
            <Button variant='outline' size='sm' onClick={handleDisconnect}>
                Disconnect
            </Button>
        </HStack>
    )
}
