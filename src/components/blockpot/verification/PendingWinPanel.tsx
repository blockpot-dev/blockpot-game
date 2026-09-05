import { Button } from '@blockpot-dev/blockpot-design-system'
import { formatEurFromMinor } from '@/utilities/formatEur'

// Surface 2 of the four silent-tier verification surfaces (BLO-675).
//
// A prize larger than the player can currently claim. The framing is settled
// and is not a matter of taste: the prize is theirs, it is safe, and
// verification is what releases it. It is never "locked", never "held", never
// "pending review".
//
// WHY THE AMOUNT IS SHOWN IN FULL
//
// Nothing about the prize is gated — only the exit. Hiding or rounding the
// figure would imply the prize itself is in question, which is the one thing
// this surface exists to deny. The player won it; they are being asked for ID
// before it leaves.
//
// The stake-recovery rule (BLO-733) means part of a large prize may already
// have been paid out automatically: a player's own net losses are returned at
// win time, capped at their remaining outflow headroom. `escrowedEurMinor` is
// what is left waiting, not the whole prize, and the copy says "of your prize"
// rather than "your prize" for exactly that reason.

export type PendingWinPanelProps = {
    /** The part of the prize still in escrow, in EUR minor. */
    escrowedEurMinor: number
    /** Starts the expedited verification flow — usually opens Surface 1. */
    onVerify: () => void
    className?: string
}

export default function PendingWinPanel({ escrowedEurMinor, onVerify, className }: PendingWinPanelProps) {
    return (
        <div
            className={`flex flex-col gap-3 rounded-lg border border-line bg-[rgba(255,255,255,0.04)] p-5 ${className ?? ''}`}
            data-slot='pending-win-panel'
            data-testid='pending-win-panel'
        >
            <div className='font-mono text-[11px] uppercase tracking-[0.16em] text-secondary-foreground'>
                Waiting for you
            </div>

            <div className='font-display text-[28px] tracking-[0.02em] text-foreground'>
                {formatEurFromMinor(escrowedEurMinor)}
            </div>

            <p className='text-sm leading-relaxed text-secondary-foreground font-body'>
                This is yours and it is safe. A quick identity check releases it to your wallet.
            </p>

            <div className='flex justify-start'>
                <Button size='default' onClick={onVerify}>
                    VERIFY AND CLAIM
                </Button>
            </div>
        </div>
    )
}
