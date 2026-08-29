import { useMemo, useState } from 'react'
import { Container } from '@blockpot-dev/blockpot-design-system'
import { CheckIcon, CopyIcon, ExternalLinkIcon } from 'lucide-react'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import useDrawProof from '@/hooks/contracts/draw/useDrawProof'
import { DrawProof, DrawProofStatus } from '@/types/draw/drawProof'
import { GameType } from '@/providers/SelectedGameProvider'
import { DRAW_ALGORITHM_LABEL } from '@/constants/draw'
import { useChainId } from 'wagmi'
import VerifySnippets from '@/components/blockpot/transparency/VerifySnippets/VerifySnippets'
import { SnippetInputs } from '@/components/blockpot/transparency/VerifySnippets/snippets'

const CHAINLINK_VRF_DOCS_URL = 'https://docs.chain.link/vrf'

const statusStyles: Record<DrawProofStatus, { label: string; className: string }> = {
    verified: { label: 'Verified', className: 'bg-green-500/15 text-green-500' },
    mismatch: { label: 'Mismatch', className: 'bg-red-500/15 text-red-500' },
    pending: { label: 'Pending', className: 'bg-gray-500/15 text-muted-foreground' },
    unavailable: { label: 'Unavailable', className: 'bg-gray-500/15 text-muted-foreground' },
}

function CopyableValue(props: { label: string; value: string }) {
    const { label, value } = props
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
                <span className='font-mono text-xs text-muted-foreground break-all'>{value}</span>
                <button
                    type='button'
                    aria-label={`Copy ${label}`}
                    className='shrink-0 text-muted-foreground hover:text-foreground'
                    onClick={handleCopy}
                >
                    {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                </button>
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
    const { proof, chainId } = props
    const status = statusStyles[proof.status]
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

                {!hasProof && (
                    <p className='text-sm text-muted-foreground'>
                        The fairness proof for round {proof.roundIndex} is not available yet. It
                        appears once the round&apos;s Chainlink VRF request has been fulfilled and
                        the numbers have been drawn.
                    </p>
                )}

                {hasProof && (
                    <>
                        <VStack className='gap-3'>
                            <CopyableValue label='VRF request ID' value={proof.inputs.requestId.toString()} />
                            <CopyableValue label='VRF seed' value={`0x${proof.inputs.seed.toString(16)}`} />
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
                                draw. This should never happen — please report it.
                            </p>
                        )}
                    </>
                )}

                <div className='border-t border-border' />

                <VStack className='gap-2'>
                    <span className='text-sm font-medium text-foreground'>Verify it yourself</span>
                    <p className='text-xs text-muted-foreground'>
                        Each draw&apos;s numbers are derived from the Chainlink VRF seed by a partial
                        Fisher-Yates shuffle over 0 – maxNumber, with keccak256-based rejection sampling so
                        every index is drawn with zero modulo bias. The code below is what your browser runs
                        to recompute the draw — paste it anywhere and compare the output with the on-chain
                        numbers. To avoid trusting this page for the seed itself, fetch it from the
                        random-number provider contract; the VRF coordinator verifies the cryptographic proof
                        on-chain before the seed is accepted, as documented by Chainlink.
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
                    reproducedNumbers: [],
                    onChainNumbers: [],
                    matches: false,
                    status: 'pending',
                }}
                chainId={chainId}
            />
        )
    }

    return <_DrawFairnessProof proof={drawProof} chainId={chainId} />
}
