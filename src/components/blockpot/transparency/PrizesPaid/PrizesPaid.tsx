import { useState } from 'react'
import { isAddressEqual } from 'viem'
import { Container } from '@blockpot-dev/blockpot-design-system'
import { CheckIcon, CopyIcon, ExternalLinkIcon } from 'lucide-react'
import { useChainId } from 'wagmi'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import useRoundPrizesPaid from '@/hooks/contracts/draw/useRoundPrizesPaid'
import { DrawnNumber } from '@/types/draw'
import { ZERO_ADDRESS } from '@/web3/constants'
import { GameType } from '@/providers/SelectedGameProvider'
import { formatEtherMaxDecimalsGreedy } from '@/utilities/formatters'
import { explorerAddressUrl } from '@/constants/network-details'

// Pseudonymous by design: a truncated address, no ENS lookup and no names.
function shorten(address: string): string {
    return `${address.slice(0, 6)}…${address.slice(-4)}`
}

const ORDINALS = ['1st', '2nd', '3rd']

function ordinal(rank: number): string {
    return ORDINALS[rank - 1] ?? `${rank}th`
}

function RecipientRow(props: { draw: DrawnNumber; rank: number; chainId: number }) {
    const { draw, rank, chainId } = props
    const [copied, setCopied] = useState(false)
    const href = explorerAddressUrl(chainId, draw.winner)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(draw.winner)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // clipboard may be unavailable in some environments — silently ignore
        }
    }

    return (
        // A plain div, not HStack: HStack's props are {className, children} only,
        // so a data-testid passed to it is silently dropped.
        <div
            className='flex flex-row gap-4 justify-between items-center'
            data-testid={`prize-row-${rank}`}
        >
            <span className='text-sm text-secondary-foreground shrink-0'>{ordinal(rank)} prize</span>
            <HStack className='gap-2 items-center min-w-0'>
                <span className='text-sm font-mono' data-testid={`prize-amount-${rank}`}>
                    {formatEtherMaxDecimalsGreedy(draw.prize, 4)} ETH
                </span>
                <span
                    className='font-mono text-xs text-muted-foreground truncate'
                    data-testid={`prize-recipient-${rank}`}
                >
                    {shorten(draw.winner)}
                </span>
                <button
                    type='button'
                    aria-label={`Copy ${ordinal(rank)} prize recipient address`}
                    className='shrink-0 text-muted-foreground hover:text-foreground'
                    onClick={handleCopy}
                >
                    {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                </button>
                {href && (
                    <a
                        href={href}
                        target='_blank'
                        rel='noreferrer'
                        aria-label={`View ${ordinal(rank)} prize recipient on the block explorer`}
                        className='shrink-0 text-muted-foreground hover:text-foreground'
                    >
                        <ExternalLinkIcon size={14} />
                    </a>
                )}
            </HStack>
        </div>
    )
}

export type _PrizesPaidProps = {
    draws: readonly DrawnNumber[]
    roundIndex: number
    chainId: number
    isLoading?: boolean
}

/** Props-driven view (storybook + test target). */
export function _PrizesPaid(props: _PrizesPaidProps) {
    const { draws, roundIndex, chainId, isLoading = false } = props
    // A draw with no match leaves winner at the zero address — no prize was paid.
    const paid = draws
        .map((draw, index) => ({ draw, rank: index + 1 }))
        .filter(({ draw }) => !isAddressEqual(draw.winner, ZERO_ADDRESS))

    return (
        <Container className='p-6' containerClassName='h-full'>
            <VStack className='gap-4'>
                <h2 className='text-xl font-semibold'>Prizes paid</h2>

                <div className='border-t border-border' />

                {isLoading && (
                    <p className='text-sm text-muted-foreground' data-testid='prizes-loading'>
                        Loading prizes for round {roundIndex} from the chain…
                    </p>
                )}

                {!isLoading && paid.length === 0 && (
                    <p className='text-sm text-muted-foreground' data-testid='prizes-empty'>
                        No match this draw — the prize pool rolled forward.
                    </p>
                )}

                {!isLoading && paid.length > 0 && (
                    <VStack className='gap-2'>
                        {paid.map(({ draw, rank }) => (
                            <RecipientRow key={rank} draw={draw} rank={rank} chainId={chainId} />
                        ))}
                    </VStack>
                )}
            </VStack>
        </Container>
    )
}

export type PrizesPaidProps = {
    game: GameType
    roundIndex: number
}

export default function PrizesPaid(props: PrizesPaidProps) {
    const { game, roundIndex } = props
    const chainId = useChainId()
    const { draws, isLoading } = useRoundPrizesPaid(game, roundIndex)

    return (
        <_PrizesPaid
            draws={draws ?? []}
            roundIndex={roundIndex}
            chainId={chainId}
            isLoading={isLoading || !draws}
        />
    )
}
