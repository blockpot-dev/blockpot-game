import { Address } from 'viem'
import { PretxRequiredAction } from '@/hooks/player/usePretxDeposit'

export type ClaimDecision = {
    allow: boolean
    reason: string
    requiredAction: PretxRequiredAction
    // Remaining room under the outflow cap, sent by the service on
    // HEADROOM_EXCEEDED rejections — drives the partial-claim suggestion.
    headroomEurMinor?: number
    operationId?: string
}

export type ClaimRequestInput = {
    fromWallet: Address
    toWallet: Address
    amountWei: bigint
    chainId: number
    inWeth: boolean
}
