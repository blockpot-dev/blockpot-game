import { Button, Dialog, DialogContent, DialogTitle } from '@blockpot-dev/block-pot-design-system'
import { Config, Connector, CreateConnectorFn, useConnect } from 'wagmi'
import { ConnectMutate } from 'wagmi/query'
import VStack from '../core/VStack/VStack'
import HStack from '../core/HStack/HStack'
import { XIcon } from 'lucide-react'
import { chains } from '@/providers/Web3Provider'

export type PureWalletOptionsDialogProps = WalletOptionsDialogProps & {
    connectors: readonly Connector<CreateConnectorFn>[]
    connect: ConnectMutate<Config, unknown>
    preferredChainId: number
}

export function PureWalletOptionsDialog(props: PureWalletOptionsDialogProps) {
    const { open, onClose, connectors, connect, preferredChainId } = props

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false}>
                <HStack className='gap-4 items-center justify-between w-full'>
                    <DialogTitle className='uppercase heading-xl font-normal h-auto'>Connect Wallet</DialogTitle>
                    <Button variant='ghost' size='icon' className='size-6 p-0' onClick={onClose}>
                        <XIcon className='size-6' />
                    </Button>
                </HStack>
                <VStack className='pt-6 gap-4'>
                    {connectors.map((connector) => (
                        <Button
                            variant='outline'
                            key={connector.id}
                            onClick={() => {
                                connect({ connector, chainId: preferredChainId })
                                onClose()
                            }}
                            className='normal-case'
                            size='sm'
                        >
                            {
                                connector.icon && (<img src={connector.icon.trim()} alt={connector.name} className="w-6 h-6" />)
                            }
                            {connector.name}
                        </Button>
                    ))}
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
    const { connectors, connect } = useConnect()

    return (
        <PureWalletOptionsDialog
            open={open}
            onClose={onClose}
            connectors={connectors.toSorted((a, b) => a.name.localeCompare(b.name))}
            connect={connect}
            preferredChainId={preferredChainId}
        />
    )
}