import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import useReferralBinding from '@/hooks/referral/useReferralBinding'
import usePendingReferralCode from '@/hooks/referral/usePendingReferralCode'
import useReferralCodeCheck, { ReferralCodeStatus } from '@/hooks/referral/useReferralCodeCheck'

function shorten(address: string): string {
    return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export type ReferralBannerViewProps = {
    referrer: `0x${string}` | null
    code: string
    onCodeChange: (value: string) => void
    checkStatus: ReferralCodeStatus
    /** Start expanded (defaults to true when a code is already present, e.g. from `?ref=`). */
    defaultOpen?: boolean
}

/**
 * Props-driven view (storybook target). Renders as a one-line disclosure that sits
 * directly above the Register button; the input only appears once the player opts in.
 */
export function ReferralBannerView({ referrer, code, onCodeChange, checkStatus, defaultOpen }: ReferralBannerViewProps) {
    const [open, setOpen] = useState(defaultOpen ?? code.length > 0)

    if (referrer) {
        return (
            <p className='text-xs text-secondary-foreground leading-snug'>
                Referred by <span className='font-mono text-foreground'>{shorten(referrer)}</span> — your entries
                support your referrer at no cost to you or the prize pool.
            </p>
        )
    }

    return (
        <div className='flex flex-col gap-2'>
            <button
                type='button'
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
                aria-controls='referral-code-field'
                className='self-start inline-flex items-center gap-1 text-xs text-secondary-foreground hover:text-foreground underline-offset-2 hover:underline cursor-pointer'
            >
                Add a referral code
                <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
            </button>
            {open && (
                <div id='referral-code-field' className='flex flex-col gap-1'>
                    <input
                        id='referral-code'
                        aria-label='Referral code (optional)'
                        className='w-full h-[41px] bg-background border border-border rounded-sm px-3 font-mono text-sm uppercase placeholder:normal-case placeholder:text-secondary-foreground/60 focus:outline-none focus:border-foreground/40'
                        placeholder='Referral code'
                        autoComplete='off'
                        spellCheck={false}
                        value={code}
                        onChange={(e) => onCodeChange(e.target.value)}
                    />
                    {checkStatus === 'checking' && (
                        <p className='text-xs text-secondary-foreground leading-snug' role='status'>
                            Checking code…
                        </p>
                    )}
                    {checkStatus === 'valid' && (
                        <p className='text-xs text-secondary-foreground leading-snug'>
                            Your entries will support <span className='font-mono text-foreground'>{code.toUpperCase()}</span> —
                            paid from the operator fee, never the prize pool.
                        </p>
                    )}
                    {(checkStatus === 'invalid' || checkStatus === 'inactive') && (
                        <p className='text-xs text-amber-500 leading-snug'>
                            This code isn&apos;t active. You can still enter — the code just won&apos;t be applied.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

/**
 * Referral attribution surface in the entry panel. Before a wallet is bound it offers the
 * code field behind a disclosure (auto-open when pre-filled from `?ref=` deep links); once
 * the first attributed entry lands, the immutable on-chain binding takes over and only the
 * attribution notice remains. All copy is fail-soft: a bad code warns, but never blocks an
 * entry — mirroring the contract's behavior.
 */
export default function ReferralBanner() {
    const { configured, referrer } = useReferralBinding()
    const { code, setCode } = usePendingReferralCode()
    const check = useReferralCodeCheck(code)

    if (!configured) return null
    return <ReferralBannerView referrer={referrer} code={code} onCodeChange={setCode} checkStatus={check.status} />
}
