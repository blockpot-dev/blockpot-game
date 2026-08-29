import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PureWalletOptionsDialog } from './WalletOptionsDialog'
import type { Connector, CreateConnectorFn } from 'wagmi'

const metamask = { id: 'io.metamask', name: 'MetaMask', icon: undefined } as unknown as Connector<CreateConnectorFn>

describe('<PureWalletOptionsDialog>', () => {
    it('renders an empty state when no connectors are available', async () => {
        render(
            <PureWalletOptionsDialog
                open
                onClose={vi.fn()}
                connectors={[]}
                connect={vi.fn()}
                preferredChainId={1}
                status='idle'
                error={null}
                pendingConnectorName={undefined}
            />,
        )
        expect(await screen.findByText('No wallet found. Install a wallet to enter.')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('stays open and calls connect when a wallet is chosen', async () => {
        const onClose = vi.fn()
        const connect = vi.fn()
        render(
            <PureWalletOptionsDialog
                open
                onClose={onClose}
                connectors={[metamask]}
                connect={connect}
                preferredChainId={1}
                status='idle'
                error={null}
                pendingConnectorName={undefined}
            />,
        )
        fireEvent.click(await screen.findByRole('button', { name: /MetaMask/ }))
        expect(connect).toHaveBeenCalledTimes(1)
        expect(onClose).not.toHaveBeenCalled()
    })

    it('shows a connecting line while pending and a friendly error on failure', async () => {
        const { rerender } = render(
            <PureWalletOptionsDialog
                open
                onClose={vi.fn()}
                connectors={[metamask]}
                connect={vi.fn()}
                preferredChainId={1}
                status='pending'
                error={null}
                pendingConnectorName='MetaMask'
            />,
        )
        expect(await screen.findByText('Connecting to MetaMask…')).toBeInTheDocument()

        rerender(
            <PureWalletOptionsDialog
                open
                onClose={vi.fn()}
                connectors={[metamask]}
                connect={vi.fn()}
                preferredChainId={1}
                status='error'
                error={new Error('User rejected the request. Details: 0xdeadbeef')}
                pendingConnectorName='MetaMask'
            />,
        )
        expect(await screen.findByText('Couldn\'t connect to MetaMask. Try again.')).toBeInTheDocument()
        expect(screen.queryByText(/0xdeadbeef/)).not.toBeInTheDocument()
    })
})
