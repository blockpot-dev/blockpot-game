import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { _DrawFairnessProof } from './DrawFairnessProof'
import { DrawProof } from '@/types/lottery/drawProof'

const SEED = 0x1111111111111111111111111111111111111111111111111111111111112222n
const REQUEST_ID = 987654321n

function proof(overrides: Partial<DrawProof> = {}): DrawProof {
    return {
        roundIndex: 7,
        lotteryAddress: '0x1000000000000000000000000000000000000001',
        randomNumberProviderAddress: '0x2000000000000000000000000000000000000002',
        inputs: {
            requestId: REQUEST_ID,
            seed: SEED,
            maxNumber: 99,
            totalNumbers: 5,
        },
        reproducedNumbers: [62, 37, 75, 74, 92],
        onChainNumbers: [62, 37, 75, 74, 92],
        matches: true,
        status: 'verified',
        ...overrides,
    }
}

describe('<_DrawFairnessProof>', () => {
    it('shows seed, requestId, both number rows, and a verified indicator', () => {
        render(<_DrawFairnessProof proof={proof()} />)

        expect(screen.getByText(new RegExp(SEED.toString(16), 'i'))).toBeInTheDocument()
        expect(screen.getByText(new RegExp(REQUEST_ID.toString()))).toBeInTheDocument()
        expect(screen.getByTestId('reproduced-numbers')).toHaveTextContent('62 37 75 74 92')
        expect(screen.getByTestId('onchain-numbers')).toHaveTextContent('62 37 75 74 92')
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
            />
        )

        expect(screen.getAllByText(/not.*available|unavailable|pending/i).length).toBeGreaterThan(0)
        expect(screen.queryByTestId('reproduced-numbers')).not.toBeInTheDocument()
    })

    it('links a documented Chainlink VRF proof verification path', () => {
        render(<_DrawFairnessProof proof={proof()} />)
        const link = screen.getByRole('link', { name: /chainlink/i })
        expect(link).toHaveAttribute('href', expect.stringContaining('chain.link'))
    })
})
