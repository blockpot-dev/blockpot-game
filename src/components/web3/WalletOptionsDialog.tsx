import { Button, Dialog, DialogContent, DialogTitle } from '@blockpot-dev/blockpot-design-system'
import { Config, Connector, CreateConnectorFn, useConnect } from 'wagmi'
import { ConnectMutate } from 'wagmi/query'
import VStack from '../core/VStack/VStack'
import HStack from '../core/HStack/HStack'
import { XIcon } from 'lucide-react'
import { chains } from '@/providers/Web3Provider'

export type WalletConnectStatus = 'idle' | 'pending' | 'success' | 'error'

// Raw wallet errors (user rejection, provider quirks, hex details) never reach
// the player — one friendly line names the wallet and the next step.
export function walletConnectErrorMessage(walletName: string): string {
    return `Couldn't connect to ${walletName}. Try again.`
}

export type PureWalletOptionsDialogProps = WalletOptionsDialogProps & {
    connectors: readonly Connector<CreateConnectorFn>[]
    connect: ConnectMutate<Config, unknown>
    preferredChainId: number
    status: WalletConnectStatus
    error: Error | null
    // Name of the connector the last connect attempt targeted, if any.
    pendingConnectorName: string | undefined
}

export function PureWalletOptionsDialog(props: PureWalletOptionsDialogProps) {
    const { open, onClose, connectors, connect, preferredChainId, status, error, pendingConnectorName } = props
    const isConnecting = status === 'pending'
    const walletName = pendingConnectorName ?? 'your wallet'

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false}>
                <HStack className='gap-4 items-center justify-between w-full'>
                    <DialogTitle className='uppercase heading-xl font-normal h-auto'>Connect wallet</DialogTitle>
                    <Button variant='ghost' size='icon' className='size-6 p-0' onClick={onClose} aria-label='Close'>
                        <XIcon className='size-6' />
                    </Button>
                </HStack>
                <VStack className='pt-6 gap-4'>
                    {connectors.length === 0 && (
                        <p className='text-sm text-secondary-foreground'>No wallet found. Install a wallet to enter.</p>
                    )}
                    {connectors.map((connector) => (
                        <Button
                            variant='outline'
                            key={connector.id}
                            disabled={isConnecting}
                            onClick={() => connect({ connector, chainId: preferredChainId }, { onSuccess: onClose })}
                            className='normal-case'
                            size='sm'
                        >
                            {
                                connector.icon && (<img src={connector.icon.trim()} alt='' className="w-6 h-6" />)
                            }
                            {connector.name}
                        </Button>
                    ))}
                    {isConnecting && (
                        <p className='text-sm text-secondary-foreground' role='status'>{`Connecting to ${walletName}…`}</p>
                    )}
                    {status === 'error' && error && (
                        <p className='text-sm text-destructive' role='alert'>{walletConnectErrorMessage(walletName)}</p>
                    )}
                </VStack>
            </DialogContent>
        </Dialog>
    )
}

export type WalletOptionsDialogProps = {
    open: boolean
    onClose: () => void
}

export default function WalletOptionsDialog(props: WalletOptionsDialogProps) {
    const { open, onClose } = props
    const preferredChainId = chains[0].id
    const { connectors, connect, status, error, variables } = useConnect()
    const pendingConnector = variables?.connector
    const pendingConnectorName = pendingConnector && 'name' in pendingConnector ? pendingConnector.name : undefined

    return (
        <PureWalletOptionsDialog
            open={open}
            onClose={onClose}
            connectors={connectors.toSorted((a, b) => a.name.localeCompare(b.name))}
            connect={connect}
            preferredChainId={preferredChainId}
            status={status}
            error={error}
            pendingConnectorName={pendingConnectorName}
        />
    )
}
