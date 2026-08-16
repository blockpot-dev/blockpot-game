import { referralManagerAbi } from '@/abi/referralManagerAbi'
import { ContractName } from '@/constants/contract-addresses'
import useReadContract from './useReadContract'

export default function useReferralManagerRead() {
    return useReadContract(ContractName.REFERRAL_MANAGER, referralManagerAbi)
}
