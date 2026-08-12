import { formatDate } from '@/utilities/time/format-date'
import { readableTime } from '@/utilities/time/readable-time'

// View-model for the cool-off / entry-block status. Derived from the on-chain
// KYCRegistry.entryBlockedUntil read (uint64 epoch seconds; 0 = not blocked).
export type CoolOffStatus = {
    isCoolingOff: boolean
    blockedUntil: bigint
    endLabel: string
    remainingLabel: string
}

export function deriveCoolOffStatus(blockedUntil: bigint, nowSeconds: number): CoolOffStatus {
    const isCoolingOff = blockedUntil > BigInt(Math.floor(nowSeconds))
    if (!isCoolingOff) {
        return { isCoolingOff: false, blockedUntil, endLabel: '', remainingLabel: '' }
    }
    // Number(blockedUntil) is safe for realistic timestamps (far below 2^53).
    const end = Number(blockedUntil)
    return {
        isCoolingOff: true,
        blockedUntil,
        endLabel: formatDate(end),
        remainingLabel: readableTime(end - Math.floor(nowSeconds)),
    }
}
