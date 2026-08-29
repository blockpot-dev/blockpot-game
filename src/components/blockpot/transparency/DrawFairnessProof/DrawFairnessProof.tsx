import { useMemo, useState } from 'react'
import { Container } from '@blockpot-dev/blockpot-design-system'
import { CheckIcon, CopyIcon, ExternalLinkIcon } from 'lucide-react'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import useDrawProof from '@/hooks/contracts/draw/useDrawProof'
import { DrawProof, DrawProofStatus } from '@/types/draw/drawProof'
import { GameType } from '@/providers/SelectedGameProvider'
import { DRAW_ALGORITHM_LABEL } from '@/constants/draw'
import { BLOCK_EXPLORER_URL, NetworkId, explorerAddressUrl, explorerTxUrl } from '@/constants/network-details'
import { useChainId } from 'wagmi'
import VerifySnippets from '@/components/blockpot/transparency/VerifySnippets/VerifySnippets'
import { SnippetInputs } from '@/components/blockpot/transparency/VerifySnippets/snippets'

const CHAINLINK_VRF_DOCS_URL = 'https://docs.chain.link/vrf'
const REPORT_URL = 'https://t.me/playblockpot'

const statusStyles: Record<DrawProofStatus | 'loading', { label: string; className: string }> = {
    verified: { label: 'Verified', className: 'bg-green-500/15 text-green-500' },
    mismatch: { label: 'Mismatch', className: 'bg-red-500/15 text-red-500' },
    pending: { label: 'Pending', className: 'bg-gray-500/15 text-muted-foreground' },
    loading: { label: 'Checking…', className: 'bg-gray-500/15 text-muted-foreground' },
    unavailable: { label: 'Unavailable', className: 'bg-gray-500/15 text-muted-foreground' },
}

function CopyableValue(props: { label: string; value: string; href?: string; hrefLabel?: string; testId?: string }) {
    const { label, value, href, hrefLabel, testId } = props
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // clipboard may be unavailable in some environments — silently ignore
        }
    }

    return (
        <VStack className='gap-1'>
            <span className='text-sm font-medium text-foreground'>{label}</span>
            <HStack className='gap-2 items-start'>
                <span className='font-mono text-xs text-muted-foreground break-all' data-testid={testId}>{value}</span>
                <button
                    type='button'
                    aria-label={`Copy ${label}`}
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
                        aria-label={hrefLabel ?? `View ${label} on the block explorer`}
                        className='shrink-0 text-muted-foreground hover:text-foreground'
                    >
                        <ExternalLinkIcon size={14} />
                    </a>
                )}
            </HStack>
        </VStack>
    )
}

function NumberRow(props: { label: string; numbers: readonly number[]; testId: string }) {
    const { label, numbers, testId } = props
    return (
        <HStack className='justify-between'>
            <span className='text-sm text-secondary-foreground'>{label}</span>
            <span className='text-sm font-mono' data-testid={testId}>
                {numbers.join(' ')}
            </span>
        </HStack>
    )
}

function ValueRow(props: { label: string; value: string; testId: string }) {
    const { label, value, testId } = props
    return (
        <HStack className='justify-between'>
            <span className='text-sm text-secondary-foreground'>{label}</span>
            <span className='text-sm font-mono' data-testid={testId}>{value}</span>
        </HStack>
    )
}

export type _DrawFairnessProofProps = {
    proof: DrawProof
    chainId: number
    /** True while the proof is being read from the chain; shows a checking state instead of "pending". */
    isLoading?: boolean
}

function toSnippetInputs(proof: DrawProof, chainId: number): SnippetInputs {
    const hasProof = proof.status === 'verified' || proof.status === 'mismatch'
    return {
        seed: hasProof ? proof.inputs.seed : null,
        maxNumber: hasProof ? proof.inputs.maxNumber : null,
        totalNumbers: hasProof ? proof.inputs.totalNumbers : null,
        expected: hasProof ? proof.onChainNumbers : null,
        drawAddress: proof.drawAddress,
        randomNumberProviderAddress: proof.randomNumberProviderAddress,
        roundIndex: proof.roundIndex,
        chainId,
    }
}

export function _DrawFairnessProof(props: _DrawFairnessProofProps) {
    const { proof, chainId, isLoading = false } = props
    const status = statusStyles[isLoading ? 'loading' : proof.status]
    const hasProof = proof.status === 'verified' || proof.status === 'mismatch'
    const snippetInputs = useMemo(() => toSnippetInputs(proof, chainId), [proof, chainId])

    return (
        <Container className='p-6' containerClassName='h-full'>
            <VStack className='gap-4'>
                <HStack className='justify-between items-center'>
                    <h2 className='text-xl font-semibold'>Draw fairness proof</h2>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.className}`}>
                        {status.label}
                    </span>
                </HStack>

                <div className='border-t border-border' />

                {!hasProof && isLoading && (
                    <p className='text-sm text-muted-foreground' data-testid='proof-loading'>
                        Loading round {proof.roundIndex} from the chain…
                    </p>
                )}

                {!hasProof && !isLoading && proof.status === 'pending' && (
                    <p className='text-sm text-muted-foreground' data-testid='proof-pending'>
                        Round {proof.roundIndex} hasn&apos;t been drawn yet. The proof appears once
                        Chainlink VRF returns the seed and the numbers are drawn.
                    </p>
                )}

                {!hasProof && !isLoading && proof.status === 'unavailable' && (
                    <p className='text-sm text-muted-foreground' data-testid='proof-unavailable'>
                        No proof for round {proof.roundIndex}. This round has no fulfilled VRF
                        request on-chain.
                    </p>
                )}

                {hasProof && (
                    <>
                        <VStack className='gap-3'>
                            <CopyableValue label='VRF request ID' value={proof.inputs.requestId.toString()} />
                            <CopyableValue label='VRF seed' value={`0x${proof.inputs.seed.toString(16)}`} />
                            {proof.fulfillmentTxHash ? (
                                <CopyableValue
                                    label='Fulfillment transaction'
                                    value={proof.fulfillmentTxHash}
                                    href={explorerTxUrl(chainId, proof.fulfillmentTxHash)}
                                    hrefLabel='View fulfillment transaction on the block explorer'
                                    testId='fulfillment-tx'
                                />
                            ) : (
                                <VStack className='gap-1'>
                                    <span className='text-sm font-medium text-foreground'>Fulfillment transaction</span>
                                    <span className='text-xs text-muted-foreground' data-testid='fulfillment-tx-missing'>
                                        Not found on this node. Search the random-number provider contract for the
                                        request ID above.
                                    </span>
                                </VStack>
                            )}
                            <CopyableValue
                                label='Random-number provider contract'
                                value={proof.randomNumberProviderAddress}
                                href={explorerAddressUrl(chainId, proof.randomNumberProviderAddress)}
                                hrefLabel='View provider contract on the block explorer'
                                testId='provider-address'
                            />
                            <CopyableValue
                                label='Draw contract'
                                value={proof.drawAddress}
                                href={explorerAddressUrl(chainId, proof.drawAddress)}
                                hrefLabel='View draw contract on the block explorer'
                                testId='draw-address'
                            />
                            {!BLOCK_EXPLORER_URL[chainId as NetworkId] && (
                                <p className='text-xs text-muted-foreground' data-testid='no-explorer'>
                                    No public block explorer for this network yet — copy the hash and inspect it
                                    against any node for this chain.
                                </p>
                            )}
                        </VStack>

                        <div className='border-t border-border' />

                        <VStack className='gap-2'>
                            <ValueRow
                                label='Number space'
                                value={`0 – ${proof.inputs.maxNumber}`}
                                testId='number-space'
                            />
                            <ValueRow
                                label='Numbers drawn'
                                value={String(proof.inputs.totalNumbers)}
                                testId='numbers-drawn'
                            />
                            <ValueRow label='Algorithm' value={DRAW_ALGORITHM_LABEL} testId='algorithm' />
                        </VStack>

                        <div className='border-t border-border' />

                        <VStack className='gap-2'>
                            <NumberRow
                                label='Recomputed from seed'
                                numbers={proof.reproducedNumbers}
                                testId='reproduced-numbers'
                            />
                            <NumberRow
                                label='On-chain draw'
                                numbers={proof.onChainNumbers}
                                testId='onchain-numbers'
                            />
                        </VStack>

                        {proof.status === 'mismatch' && (
                            <p className='text-xs text-red-500'>
                                The numbers recomputed in your browser do not equal the on-chain
                                draw. This should never happen. Copy the seed and round number and{' '}
                                <a href={REPORT_URL} target='_blank' rel='noreferrer' className='underline'>
                                    report it on Telegram
                                </a>
                                .
                            </p>
                        )}
                    </>
                )}

                <div className='border-t border-border' />

                <VStack className='gap-2'>
                    <span className='text-sm font-medium text-foreground'>Check the draw yourself</span>
                    <p className='text-xs text-muted-foreground'>
                        The code below is exactly what your browser ran to recompute the numbers —
                        paste it anywhere and compare with the on-chain draw. It rebuilds the draw from
                        the Chainlink VRF seed with a shuffle that makes every number equally likely
                        (partial Fisher-Yates with rejection sampling). Don&apos;t want to trust this
                        page for the seed? Get it from the contract in the last tab; the VRF coordinator
                        verifies Chainlink&apos;s proof on-chain before the seed is accepted.
                    </p>
                    <VerifySnippets inputs={snippetInputs} />
                    <a
                        href={CHAINLINK_VRF_DOCS_URL}
                        target='_blank'
                        rel='noreferrer'
                        className='text-xs text-primary underline inline-flex items-center gap-1'
                    >
                        Chainlink VRF verification docs
                        <ExternalLinkIcon size={12} />
                    </a>
                </VStack>
            </VStack>
        </Container>
    )
}

export type DrawFairnessProofProps = {
    game: GameType
    roundIndex: number
}

export default function DrawFairnessProof(props: DrawFairnessProofProps) {
    const { game, roundIndex } = props
    const chainId = useChainId()
    const { drawProof, isLoading } = useDrawProof(game, roundIndex)

    if (isLoading || !drawProof) {
        return (
            <_DrawFairnessProof
                proof={{
                    roundIndex,
                    drawAddress: '0x0000000000000000000000000000000000000000',
                    randomNumberProviderAddress: '0x0000000000000000000000000000000000000000',
                    inputs: { requestId: 0n, seed: 0n, maxNumber: 0, totalNumbers: 0 },
                    fulfillmentTxHash: null,
                    reproducedNumbers: [],
                    onChainNumbers: [],
                    matches: false,
                    status: 'pending',
                }}
                chainId={chainId}
                isLoading
            />
        )
    }

    return <_DrawFairnessProof proof={drawProof} chainId={chainId} />
}
