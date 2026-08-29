import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { referralManagerAbi } from '@/abi/referralManagerAbi'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { ZERO_ADDRESS } from '@/web3/constants'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useReferralManagerRead from '@/hooks/contracts/read/useReferralManagerRead'
import useTrackedContractWrite from '@/hooks/web3/useTrackedContractWrite'

export interface ReferrerDashboardRecord {
    status: 'active' | 'suspended' | 'terminated'
    effectiveShareBps: number
    accrued: bigint
    lifetimeEarned: bigint
    lifetimeClaimed: bigint
}

const STATUS_BY_INDEX = ['none', 'active', 'suspended', 'terminated'] as const

// The connected wallet's own referrer record (null unless operator-registered) plus the
// claim action. Claim requires Active status and a clean sanctions screen on-chain; the
// contract's revert reasons surface through the tracked-write toast flow.
export default function useReferrerDashboard() {
    const chainId = useChainId()
    const account = useAccountAddress()
    const manager = getContractAddress(chainId, ContractName.REFERRAL_MANAGER)
    const rm = useReferralManagerRead().read

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['referrerDashboard', chainId, account],
        queryFn: async (): Promise<ReferrerDashboardRecord | null> => {
            const [statusIndex, , , accrued, lifetimeEarned, lifetimeClaimed] = await rm.referrers([account])
            const status = STATUS_BY_INDEX[Number(statusIndex)]
            if (status === 'none') return null
            const shareBps = await rm.effectiveShareBps([account])
            return {
                status,
                effectiveShareBps: Number(shareBps),
                accrued,
                lifetimeEarned,
                lifetimeClaimed,
            }
        },
        enabled: manager !== ZERO_ADDRESS && account !== ZERO_ADDRESS,
    })

    const claimWrite = useTrackedContractWrite({
        address: manager,
        abi: referralManagerAbi,
        functionName: 'claim',
    })

    const claim = async () => {
        await claimWrite.writeAsync([], 'Claiming referral rewards')
        void refetch()
    }

    return {
        record: data ?? null,
        isLoading,
        isError,
        refetch,
        claim,
        isClaiming: Boolean(claimWrite.isLoading),
    }
}
