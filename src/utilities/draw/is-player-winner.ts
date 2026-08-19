import { Address, isAddressEqual } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'

export function isPlayerWinner(drawWinner: Address, viewer: Address): boolean {
    if (isAddressEqual(drawWinner, ZERO_ADDRESS)) return false
    if (isAddressEqual(viewer, ZERO_ADDRESS)) return false
    return isAddressEqual(drawWinner, viewer)
}
