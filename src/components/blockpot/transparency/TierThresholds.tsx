import { Container } from '@blockpot-dev/block-pot-design-system'
import { Fragment } from 'react'
import { useChainId } from 'wagmi'
import VStack from '@/components/core/VStack/VStack'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import useActivePolicy from '@/hooks/contracts/kyc/useActivePolicy'
import useFeedAddresses from '@/hooks/contracts/lgo/useFeedAddresses'
import { formatNumber } from '@/utilities/formatters'

function isUnbounded(value: bigint): boolean {
    return value > BigInt(Number.MAX_SAFE_INTEGER)
}

function formatEurMinor(value: bigint): string {
    if (isUnbounded(value)) return 'unlimited'
    return formatNumber(Number(value) / 100, 2)
}

function ChecksumAddress({ value }: { value: string }) {
    return (
        <span className='font-mono text-xs text-muted-foreground break-all'>
            {value.toUpperCase().replace('0X', '0x')}
        </span>
    )
}

export default function TierThresholds() {
    const chainId = useChainId()
    const lgoAddress = getContractAddress(chainId, ContractName.LGO)
    const kycRegistryAddress = getContractAddress(chainId, ContractName.KYC_REGISTRY)
    const { policy } = useActivePolicy()
    const { ethUsdFeed, eurUsdFeed } = useFeedAddresses()

    const tiers = policy?.tiers ?? []

    return (
        <Container className='p-6' containerClassName='h-full'>
            <VStack className='gap-4'>
                <h2 className='text-xl font-semibold'>KYC tier thresholds</h2>

                <div className='border-t border-border' />

                <VStack className='gap-1'>
                    <span className='text-sm font-medium text-foreground'>Contract: KYCRegistry</span>
                    <ChecksumAddress value={kycRegistryAddress} />
                </VStack>

                <VStack className='gap-1'>
                    <span className='text-sm font-medium text-foreground'>Activity provider: LGO</span>
                    <ChecksumAddress value={lgoAddress} />
                </VStack>

                <VStack className='gap-1'>
                    <span className='text-sm font-medium text-foreground'>Chainlink ETH/USD feed</span>
                    <ChecksumAddress value={ethUsdFeed} />
                </VStack>

                <VStack className='gap-1'>
                    <span className='text-sm font-medium text-foreground'>Chainlink EUR/USD feed</span>
                    <ChecksumAddress value={eurUsdFeed} />
                </VStack>

                <div className='border-t border-border' />

                <VStack className='gap-2 flex-1'>
                    <span className='text-sm font-medium text-foreground'>EUR flow caps (active policy)</span>
                    <div className='grid grid-cols-[auto_1fr_1fr] gap-x-6 gap-y-2 items-baseline'>
                        <span className='text-xs uppercase text-muted-foreground tracking-wide'>Tier</span>
                        <span className='text-xs uppercase text-muted-foreground tracking-wide text-right'>In (wagered)</span>
                        <span className='text-xs uppercase text-muted-foreground tracking-wide text-right'>Out (claimed)</span>
                        {tiers.length === 0
                            ? <span className='text-xs text-muted-foreground col-span-3'>No policy configured.</span>
                            : tiers.map((tier, i) => (
                                <Fragment key={i}>
                                    <span className='text-sm text-secondary-foreground'>Tier {i}</span>
                                    <span className='text-sm font-mono text-right'>€ {formatEurMinor(tier.inflowCapEurMinor)}</span>
                                    <span className='text-sm font-mono text-right'>€ {formatEurMinor(tier.outflowCapEurMinor)}</span>
                                </Fragment>
                            ))
                        }
                    </div>
                </VStack>

                {policy?.description && (
                    <>
                        <div className='border-t border-border' />
                        <VStack className='gap-1'>
                            <span className='text-sm font-medium text-foreground'>Policy description</span>
                            <span className='text-xs text-secondary-foreground'>{policy.description}</span>
                        </VStack>
                    </>
                )}

                <div className='border-t border-border' />

                <p className='text-xs text-muted-foreground'>
                    Each tier carries one shared set of verification gates and two directional
                    caps. The inflow cap bounds gross lifetime EUR wagered — entries that would
                    push cumulative wagers past it revert on-chain until the next tier&apos;s gates
                    are passed. The outflow cap bounds gross lifetime EUR claimed — withdrawals
                    and direct payouts beyond it are held in escrow until verification. Both caps
                    are gross per direction (wins never refund wagering headroom, wagers never
                    consume claim headroom), and a player&apos;s tier is decided by gates alone.
                    The KYCRegistry pulls both lifetime figures from the LGO via the registered
                    IKYCActivityProvider; the Chainlink feeds above are used by the LGO to convert
                    wei amounts into EUR-minor at the moment of each entry and payout.
                </p>
            </VStack>
        </Container>
    )
}
