import { Meta, StoryObj } from '@storybook/react'
import VerifySnippets from './VerifySnippets'
import { SnippetInputs } from './snippets'

const meta: Meta<typeof VerifySnippets> = {
    component: VerifySnippets,
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 720 }}>
                <Story />
            </div>
        ),
    ],
}
export default meta
type Story = StoryObj<typeof VerifySnippets>

// Vector `full-permutation` from src/utilities/draw/__fixtures__/draw-vectors.json.
// The Python snippet was run against it on 2026-08-28 (pycryptodome 3.x) and printed [2, 0, 4, 3, 1].
const verified: SnippetInputs = {
    seed: 0x1111111111111111111111111111111111111111111111111111111111112222n,
    maxNumber: 4,
    totalNumbers: 5,
    expected: [2, 0, 4, 3, 1],
    drawAddress: '0x1000000000000000000000000000000000000001',
    randomNumberProviderAddress: '0x2000000000000000000000000000000000000002',
    roundIndex: 7,
    chainId: 31337,
}

export const Verified: Story = { args: { inputs: verified } }

export const Placeholders: Story = {
    args: { inputs: { ...verified, seed: null, maxNumber: null, totalNumbers: null, expected: null } },
}

export const SolidityTab: Story = { args: { inputs: verified, initialTab: 'solidity' } }
