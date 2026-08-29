import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { _DrawFairnessProof } from './DrawFairnessProof'
import { DrawProof } from '@/types/draw/drawProof'
import { DRAW_ALGORITHM_LABEL } from '@/constants/draw'

const SEED = 0x1111111111111111111111111111111111111111111111111111111111112222n
const REQUEST_ID = 987654321n

function proof(overrides: Partial<DrawProof> = {}): DrawProof {
    return {
        roundIndex: 7,
        drawAddress: '0x1000000000000000000000000000000000000001',
        randomNumberProviderAddress: '0x2000000000000000000000000000000000000002',
        inputs: {
            requestId: REQUEST_ID,
            seed: SEED,
            maxNumber: 99,
            totalNumbers: 5,
        },
        fulfillmentTxHash: '0x9f2c1a7e5d3b4c6a8e0f1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2',
        reproducedNumbers: [62, 83, 73, 68, 77],
        onChainNumbers: [62, 83, 73, 68, 77],
        matches: true,
        status: 'verified',
        ...overrides,
    }
}

describe('<_DrawFairnessProof>', () => {
    it('shows seed, requestId, both number rows, and a verified indicator', () => {
        render(<_DrawFairnessProof proof={proof()} chainId={31337} />)

        expect(screen.getAllByText(new RegExp(SEED.toString(16), 'i')).length).toBeGreaterThan(0)
        expect(screen.getByText(new RegExp(REQUEST_ID.toString()))).toBeInTheDocument()
        expect(screen.getByTestId('reproduced-numbers')).toHaveTextContent('62 83 73 68 77')
        expect(screen.getByTestId('onchain-numbers')).toHaveTextContent('62 83 73 68 77')
        expect(screen.getByText(/verified/i)).toBeInTheDocument()
    })

    it('renders a failure state on mismatch', () => {
        render(
            <_DrawFairnessProof
                proof={proof({
                    reproducedNumbers: [1, 2, 3, 4, 5],
                    matches: false,
                    status: 'mismatch',
                })}
                chainId={31337}
            />
        )

        expect(screen.getByText(/mismatch/i)).toBeInTheDocument()
        expect(screen.queryByText(/^verified$/i)).not.toBeInTheDocument()
    })

    it('renders an unavailable state when the round has no fulfilled VRF request', () => {
        render(
            <_DrawFairnessProof
                proof={proof({
                    inputs: { requestId: 0n, seed: 0n, maxNumber: 0, totalNumbers: 0 },
                    reproducedNumbers: [],
                    onChainNumbers: [],
                    matches: false,
                    status: 'unavailable',
                })}
                chainId={31337}
            />
        )

        expect(screen.getAllByText(/not.*available|unavailable|pending/i).length).toBeGreaterThan(0)
        expect(screen.queryByTestId('reproduced-numbers')).not.toBeInTheDocument()
    })

    it('links a documented Chainlink VRF proof verification path', () => {
        render(<_DrawFairnessProof proof={proof()} chainId={31337} />)
        const link = screen.getByRole('link', { name: /chainlink/i })
        expect(link).toHaveAttribute('href', expect.stringContaining('chain.link'))
    })

    it('exposes the derivation inputs: number space, numbers drawn, and algorithm', () => {
        render(<_DrawFairnessProof proof={proof()} chainId={31337} />)
        expect(screen.getByTestId('number-space')).toHaveTextContent('0 – 99')
        expect(screen.getByTestId('numbers-drawn')).toHaveTextContent('5')
        expect(screen.getByTestId('algorithm')).toHaveTextContent(DRAW_ALGORITHM_LABEL)
    })

    it('hides the derivation rows while the proof is unavailable', () => {
        render(<_DrawFairnessProof proof={proof({ status: 'unavailable', reproducedNumbers: [], onChainNumbers: [] })} chainId={31337} />)
        expect(screen.queryByTestId('number-space')).toBeNull()
        expect(screen.queryByTestId('algorithm')).toBeNull()
    })

    it('renders runnable verification snippets pre-filled with the round seed', () => {
        render(<_DrawFairnessProof proof={proof()} chainId={31337} />)
        expect(screen.getByRole('tablist', { name: /verification language/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'JavaScript' })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('tabpanel')).toHaveTextContent(`seed: 0x${SEED.toString(16)}n`)
        expect(screen.getByRole('tabpanel')).toHaveTextContent('// expected: 62, 83, 73, 68, 77')
    })

    it('shows placeholder snippets without expected output while the proof is unavailable', () => {
        render(
            <_DrawFairnessProof
                proof={proof({ status: 'unavailable', reproducedNumbers: [], onChainNumbers: [] })}
                chainId={31337}
            />
        )
        expect(screen.getByRole('tabpanel')).toHaveTextContent('0x…')
        expect(screen.getByRole('tabpanel')).not.toHaveTextContent('expected:')
    })

    it('distinguishes loading, pending and unavailable states in copy', () => {
        const empty = { inputs: { requestId: 0n, seed: 0n, maxNumber: 0, totalNumbers: 0 }, reproducedNumbers: [], onChainNumbers: [], matches: false }
        const { unmount } = render(<_DrawFairnessProof proof={proof({ ...empty, status: 'pending' })} chainId={31337} isLoading />)
        expect(screen.getByText(/checking/i)).toBeInTheDocument()
        expect(screen.getByTestId('proof-loading')).toHaveTextContent('Loading round 7 from the chain')
        unmount()

        const r2 = render(<_DrawFairnessProof proof={proof({ ...empty, status: 'pending' })} chainId={31337} />)
        expect(screen.getByTestId('proof-pending')).toHaveTextContent(/hasn.t been drawn yet/)
        r2.unmount()

        render(<_DrawFairnessProof proof={proof({ ...empty, status: 'unavailable' })} chainId={31337} />)
        expect(screen.getByTestId('proof-unavailable')).toHaveTextContent('No proof for round 7')
    })

    it('tells the reader where to report a mismatch', () => {
        render(<_DrawFairnessProof proof={proof({ reproducedNumbers: [1, 2, 3, 4, 5], matches: false, status: 'mismatch' })} chainId={31337} />)
        expect(screen.getByRole('link', { name: /report it/i })).toHaveAttribute('href', expect.stringContaining('t.me'))
    })

    it('shows the fulfillment tx and contract addresses with explorer links when the chain has one', () => {
        render(<_DrawFairnessProof proof={proof()} chainId={1} />)
        expect(screen.getByTestId('fulfillment-tx')).toHaveTextContent('0x9f2c1a7e')
        expect(screen.getByRole('link', { name: /fulfillment transaction on the block explorer/i }))
            .toHaveAttribute('href', 'https://etherscan.io/tx/0x9f2c1a7e5d3b4c6a8e0f1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2')
        expect(screen.getByRole('link', { name: /provider contract on the block explorer/i }))
            .toHaveAttribute('href', 'https://etherscan.io/address/0x2000000000000000000000000000000000000002')
        expect(screen.getByRole('link', { name: /draw contract on the block explorer/i })).toBeInTheDocument()
        expect(screen.queryByTestId('no-explorer')).toBeNull()
    })

    it('shows the hash with copy only, and says so, when the chain has no explorer', () => {
        render(<_DrawFairnessProof proof={proof()} chainId={31337} />)
        expect(screen.getByTestId('fulfillment-tx')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /copy fulfillment transaction/i })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /block explorer/i })).toBeNull()
        expect(screen.getByTestId('no-explorer')).toBeInTheDocument()
    })

    it('explains when the fulfillment transaction could not be found', () => {
        render(<_DrawFairnessProof proof={proof({ fulfillmentTxHash: null })} chainId={1} />)
        expect(screen.getByTestId('fulfillment-tx-missing')).toHaveTextContent(/not found on this node/i)
        expect(screen.queryByTestId('fulfillment-tx')).toBeNull()
    })
})
