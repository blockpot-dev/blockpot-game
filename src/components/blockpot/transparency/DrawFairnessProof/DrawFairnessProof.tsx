import { useState } from 'react'
import { Container } from '@blockpot-dev/blockpot-design-system'
import { CheckIcon, CopyIcon, ExternalLinkIcon } from 'lucide-react'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import useDrawProof from '@/hooks/contracts/lottery/useDrawProof'
import { DrawProof, DrawProofStatus } from '@/types/lottery/drawProof'

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

export type _DrawFairnessProofProps = {
    proof: DrawProof
}

export function _DrawFairnessProof(props: _DrawFairnessProofProps) {
    const { proof } = props
    const status = statusStyles[proof.status]
    const hasProof = proof.status === 'verified' || proof.status === 'mismatch'

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
                        Each draw&apos;s numbers are derived deterministically from a Chainlink VRF
                        random word: your browser recomputes them from the seed above
                        (keccak256 rejection sampling) and compares them with the on-chain draw.
                        To independently verify the seed itself, look up the VRF request ID on the
                        random-number provider contract and confirm the fulfillment transaction —
                        the VRF coordinator verifies the cryptographic proof on-chain before the
                        seed is accepted, as documented by Chainlink.
                    </p>
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
    roundIndex: number
}

export default function DrawFairnessProof(props: DrawFairnessProofProps) {
    const { roundIndex } = props
    const { drawProof, isLoading } = useDrawProof(roundIndex)

    if (isLoading || !drawProof) {
        return (
            <_DrawFairnessProof
                proof={{
                    roundIndex,
                    lotteryAddress: '0x0000000000000000000000000000000000000000',
                    randomNumberProviderAddress: '0x0000000000000000000000000000000000000000',
                    inputs: { requestId: 0n, seed: 0n, maxNumber: 0, totalNumbers: 0 },
                    reproducedNumbers: [],
                    onChainNumbers: [],
                    matches: false,
                    status: 'pending',
                }}
            />
        )
    }

    return <_DrawFairnessProof proof={drawProof} />
}
