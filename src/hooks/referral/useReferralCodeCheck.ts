import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { ZERO_ADDRESS } from '@/web3/constants'
import useReferralManagerRead from '@/hooks/contracts/read/useReferralManagerRead'

export type ReferralCodeStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'inactive'

const CODE_RE = /^[A-Za-z0-9_]{3,32}$/

// Pre-submission advisory check for a candidate code. Strictly informational — the contract
// is fail-soft, so a bad code never blocks an entry; this only shapes the warning copy.
export default function useReferralCodeCheck(code: string) {
    const chainId = useChainId()
    const manager = getContractAddress(chainId, ContractName.REFERRAL_MANAGER)
    const rm = useReferralManagerRead().read
    const wellFormed = CODE_RE.test(code)

    const { data, isLoading } = useQuery({
        queryKey: ['referralCodeCheck', chainId, code],
        queryFn: async () => {
            const referrer = await rm.referrerByCode([code])
            if (!referrer || referrer === ZERO_ADDRESS) return { status: 'invalid' as const }
            const [status] = await rm.referrers([referrer])
            // ReferrerStatus enum: 0 None, 1 Active, 2 Suspended, 3 Terminated
            return Number(status) === 1
                ? { status: 'valid' as const, referrer }
                : { status: 'inactive' as const, referrer }
        },
        enabled: manager !== ZERO_ADDRESS && wellFormed,
        staleTime: 30_000,
    })

    if (!code) return { status: 'idle' as ReferralCodeStatus }
    if (!wellFormed) return { status: 'invalid' as ReferralCodeStatus }
    if (isLoading) return { status: 'checking' as ReferralCodeStatus }
    return { status: (data?.status ?? 'idle') as ReferralCodeStatus, referrer: data && 'referrer' in data ? data.referrer : undefined }
}
