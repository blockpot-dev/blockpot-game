import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { ZERO_ADDRESS } from '@/web3/constants'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useReferralManagerRead from '@/hooks/contracts/read/useReferralManagerRead'

// The connected wallet's on-chain referral attribution: bound once, immutably, at the first
// attributed entry. `configured` is false until a ReferralManager is deployed on this chain,
// in which case every referral surface renders nothing.
export default function useReferralBinding() {
    const chainId = useChainId()
    const account = useAccountAddress()
    const manager = getContractAddress(chainId, ContractName.REFERRAL_MANAGER)
    const rm = useReferralManagerRead().read

    const { data, isLoading } = useQuery({
        queryKey: ['referralBinding', chainId, account],
        queryFn: async () => rm.referrerOf([account]),
        enabled: manager !== ZERO_ADDRESS && account !== ZERO_ADDRESS,
    })

    const referrer = data && data !== ZERO_ADDRESS ? data : null
    return {
        configured: manager !== ZERO_ADDRESS,
        referrer,
        isBound: referrer !== null,
        isLoading,
    }
}
