import HStack from '@/components/core/HStack/HStack'
import VStack from '@/components/core/VStack/VStack'

export type LifetimeStatsRowProps = {
    wageredEurMinor: bigint
    wonEurMinor: bigint
    profitEurMinor: bigint
}

const EUR_FORMAT = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
})

function formatEurMinor(value: bigint): string {
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) return EUR_FORMAT.format(Number.MAX_SAFE_INTEGER / 100)
    return EUR_FORMAT.format(Number(value) / 100)
}

function Stat({ label, eurMinor }: { label: string, eurMinor: bigint }) {
    return (
        <VStack className='flex-1 gap-1 bg-secondary border border-border rounded-sm px-3 py-2'>
            <span className='text-xs uppercase text-secondary-foreground'>{label}</span>
            <span className='text-sm font-semibold'>{formatEurMinor(eurMinor)}</span>
        </VStack>
    )
}

export default function LifetimeStatsRow(props: LifetimeStatsRowProps) {
    return (
        <HStack className='gap-3'>
            <Stat label='Entered' eurMinor={props.wageredEurMinor} />
            <Stat label='Won' eurMinor={props.wonEurMinor} />
            <Stat label='Profit' eurMinor={props.profitEurMinor} />
        </HStack>
    )
}
