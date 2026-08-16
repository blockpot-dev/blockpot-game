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
}

/** Props-driven view (storybook target). */
export function ReferralBannerView({ referrer, code, onCodeChange, checkStatus }: ReferralBannerViewProps) {
    if (referrer) {
        return (
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                Referred by <span className="font-mono">{shorten(referrer)}</span> — your entries
                support your referrer at no cost to you or the prize pool.
            </div>
        )
    }

    return (
        <div className="space-y-1 rounded-md border border-border px-3 py-2">
            <label htmlFor="referral-code" className="text-sm font-medium">
                Referral code <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
                id="referral-code"
                className="w-full rounded border border-border bg-transparent px-2 py-1 font-mono text-sm"
                placeholder="CRYPTOJOE"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
            />
            {checkStatus === 'valid' && (
                <p className="text-xs text-muted-foreground">
                    Your entries will support <span className="font-mono">{code.toUpperCase()}</span> —
                    paid from the operator fee, never the prize pool.
                </p>
            )}
            {(checkStatus === 'invalid' || checkStatus === 'inactive') && (
                <p className="text-xs text-amber-600">
                    This code doesn&apos;t match an active referrer right now. Entries still go
                    through — the code is simply ignored on-chain.
                </p>
            )}
        </div>
    )
}

/**
 * Referral attribution surface on the play page. Before a wallet is bound it offers the
 * code field (pre-filled from `?ref=` deep links); once the first attributed entry lands,
 * the immutable on-chain binding takes over and only the attribution notice remains.
 * All copy is fail-soft: a bad code warns, but never blocks an entry — mirroring the
 * contract's behavior.
 */
export default function ReferralBanner() {
    const { configured, referrer } = useReferralBinding()
    const { code, setCode } = usePendingReferralCode()
    const check = useReferralCodeCheck(code)

    if (!configured) return null
    return <ReferralBannerView referrer={referrer} code={code} onCodeChange={setCode} checkStatus={check.status} />
}
