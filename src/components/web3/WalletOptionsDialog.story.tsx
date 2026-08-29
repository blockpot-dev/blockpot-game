import type { Meta, StoryObj } from '@storybook/react'
import type { Connector, CreateConnectorFn } from 'wagmi'
import { PureWalletOptionsDialog } from './WalletOptionsDialog'

const connectors = [
    { id: 'io.metamask', name: 'MetaMask' },
    { id: 'walletConnect', name: 'WalletConnect' },
] as unknown as Connector<CreateConnectorFn>[]

const meta: Meta<typeof PureWalletOptionsDialog> = {
    component: PureWalletOptionsDialog,
    args: {
        open: true,
        onClose: () => {},
        connect: () => {},
        preferredChainId: 1,
        connectors,
        status: 'idle',
        error: null,
        pendingConnectorName: undefined,
    },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoWalletFound: Story = {
    args: { connectors: [] },
}

export const Connecting: Story = {
    args: { status: 'pending', pendingConnectorName: 'MetaMask' },
}

export const ConnectFailed: Story = {
    args: { status: 'error', error: new Error('User rejected the request.'), pendingConnectorName: 'MetaMask' },
}
