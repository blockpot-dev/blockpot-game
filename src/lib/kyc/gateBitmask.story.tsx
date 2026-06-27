import { Meta, StoryObj } from '@storybook/react'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import type { GateType } from '@/hooks/player/usePlayerKyc'
import { GATE_BIT_POSITION, GATE_DISPLAY, gatesFromBitmask } from './gateBitmask'

// Visual catch-all for drift between block-pot-gaming-service
// gates/store.go::BitPosition and the frontend mirror.
function GateBitmaskTable() {
    const entries = (Object.entries(GATE_BIT_POSITION) as [GateType, number][])
        .sort((a, b) => a[1] - b[1])

    return (
        <VStack className='gap-4 p-6 bg-background text-foreground min-w-[560px]'>
            <span className='text-xs uppercase tracking-wide text-secondary-foreground'>
                Gate bit positions (mirror of gaming-service)
            </span>
            <VStack className='gap-2 rounded-md ring-1 ring-border bg-background/40 p-4'>
                {entries.map(([gate, bit]) => (
                    <HStack key={gate} className='items-start gap-3'>
                        <span className='text-xs font-mono text-secondary-foreground w-8 shrink-0'>
                            {bit}
                        </span>
                        <VStack className='gap-0.5 flex-1'>
                            <HStack className='items-center gap-2'>
                                <span className='text-sm font-medium text-foreground'>
                                    {GATE_DISPLAY[gate].label}
                                </span>
                                <span className='text-[10px] font-mono text-secondary-foreground'>
                                    {gate}
                                </span>
                            </HStack>
                            <span className='text-xs text-secondary-foreground'>
                                {GATE_DISPLAY[gate].description}
                            </span>
                        </VStack>
                    </HStack>
                ))}
            </VStack>
        </VStack>
    )
}

function DecodedBitmap({ bitmap }: { bitmap: bigint }) {
    const gates = gatesFromBitmask(bitmap)
    return (
        <VStack className='gap-3 p-6 bg-background text-foreground min-w-[560px]'>
            <span className='text-xs uppercase tracking-wide text-secondary-foreground'>
                Bitmap 0b{bitmap.toString(2).padStart(14, '0')} ({String(bitmap)}n)
            </span>
            <VStack className='gap-2 rounded-md ring-1 ring-border bg-background/40 p-4'>
                {gates.length === 0
                    ? <span className='text-sm text-secondary-foreground'>No gates set.</span>
                    : gates.map((g) => (
                        <span key={g} className='text-sm text-foreground font-mono'>{g}</span>
                    ))}
            </VStack>
        </VStack>
    )
}

const meta: Meta<typeof GateBitmaskTable> = {
    component: GateBitmaskTable,
}

export default meta

type Story = StoryObj<typeof GateBitmaskTable>

export const FullTable: Story = {}

export const EmptyBitmap: Story = {
    render: () => <DecodedBitmap bitmap={0n} />,
}

export const PhotoIdOnly: Story = {
    render: () => <DecodedBitmap bitmap={1n << 1n} />,
}

export const T2Style: Story = {
    render: () => <DecodedBitmap bitmap={(1n << 1n) | (1n << 2n)} />,
}

export const T3Style: Story = {
    render: () => <DecodedBitmap bitmap={(1n << 1n) | (1n << 2n) | (1n << 4n)} />,
}

export const HighBitOnly: Story = {
    render: () => <DecodedBitmap bitmap={1n << 13n} />,
}
