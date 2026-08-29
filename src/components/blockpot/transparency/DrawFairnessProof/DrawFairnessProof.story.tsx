import { Meta, StoryObj } from '@storybook/react'
import { _DrawFairnessProof } from './DrawFairnessProof'
import { DrawProof } from '@/types/draw/drawProof'

const meta: Meta<typeof _DrawFairnessProof> = {
    component: _DrawFairnessProof,
}
export default meta
type Story = StoryObj<typeof _DrawFairnessProof>

const baseProof: DrawProof = {
    roundIndex: 7,
    drawAddress: '0x1000000000000000000000000000000000000001',
    randomNumberProviderAddress: '0x2000000000000000000000000000000000000002',
    inputs: {
        requestId: 52803504918154453889054597429471783869384155972875329783196937758005064932739n,
        seed: 0x1111111111111111111111111111111111111111111111111111111111112222n,
        maxNumber: 99,
        totalNumbers: 5,
    },
    fulfillmentTxHash: '0x9f2c1a7e5d3b4c6a8e0f1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2',
    reproducedNumbers: [62, 83, 73, 68, 77],
    onChainNumbers: [62, 83, 73, 68, 77],
    matches: true,
    status: 'verified',
}

export const Verified: Story = { args: { proof: baseProof, chainId: 31337 } }

export const Mismatch: Story = {
    args: {
        proof: {
            ...baseProof,
            reproducedNumbers: [1, 2, 3, 4, 5],
            matches: false,
            status: 'mismatch',
        },
        chainId: 31337,
    },
}

export const Unavailable: Story = {
    args: {
        proof: {
            ...baseProof,
            inputs: { requestId: 0n, seed: 0n, maxNumber: 0, totalNumbers: 0 },
            reproducedNumbers: [],
            onChainNumbers: [],
            matches: false,
            status: 'unavailable',
        },
        chainId: 31337,
    },
}

export const Loading: Story = {
    args: { ...Unavailable.args, isLoading: true },
}

export const WithExplorer: Story = {
    args: { proof: baseProof, chainId: 1 },
}

export const FulfillmentNotFound: Story = {
    args: { proof: { ...baseProof, fulfillmentTxHash: null }, chainId: 31337 },
}
