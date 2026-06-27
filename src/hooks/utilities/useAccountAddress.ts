import { ZERO_ADDRESS } from '@/web3/constants'
import { useAccount } from 'wagmi'

export default function useAccountAddress() {
    const { address } = useAccount()
    return address ?? ZERO_ADDRESS
}