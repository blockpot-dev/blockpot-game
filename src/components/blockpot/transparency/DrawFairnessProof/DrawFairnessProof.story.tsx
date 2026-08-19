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
    lotteryAddress: '0x1000000000000000000000000000000000000001',
    randomNumberProviderAddress: '0x2000000000000000000000000000000000000002',
    inputs: {
        requestId: 52803504918154453889054597429471783869384155972875329783196937758005064932739n,
        seed: 0x1111111111111111111111111111111111111111111111111111111111112222n,
        maxNumber: 99,
        totalNumbers: 5,
    },
    reproducedNumbers: [62, 37, 75, 74, 92],
    onChainNumbers: [62, 37, 75, 74, 92],
    matches: true,
    status: 'verified',
}

export const Verified: Story = { args: { proof: baseProof } }

export const Mismatch: Story = {
    args: {
        proof: {
            ...baseProof,
            reproducedNumbers: [1, 2, 3, 4, 5],
            matches: false,
            status: 'mismatch',
        },
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
    },
}
