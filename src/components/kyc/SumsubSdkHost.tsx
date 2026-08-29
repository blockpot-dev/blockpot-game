import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button, InfoBanner } from '@blockpot-dev/blockpot-design-system'
import type { SnsWebSdk } from '@sumsub/websdk'
import { KycTier } from '@/hooks/player/usePlayerKyc'
import useKycToken from '@/hooks/player/useKycToken'
import { SUPPORT_URL } from '@/constants/support'

export type SumsubSdkHostProps = {
    targetTier: KycTier
    onComplete?: () => void
    onError?: (message: string) => void
}

// Lazy-import the SDK bundle so it stays out of the /play route.
async function loadSdk() {
    const mod = await import('@sumsub/websdk')
    return mod.default
}

// See https://docs.sumsub.com/docs/get-started-with-web-sdk.
export default function SumsubSdkHost({ targetTier, onComplete, onError }: SumsubSdkHostProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const tokenMutation = useKycToken()
    const [error, setError] = useState<string | null>(null)
    const [ready, setReady] = useState(false)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let cancelled = false
        let instance: SnsWebSdk | null = null

        const init = async () => {
            try {
                const tokenResult = await tokenMutation.mutateAsync(targetTier)
                if (cancelled) return

                const snsWebSdk = await loadSdk()
                if (cancelled || !containerRef.current) return

                // Callbacks below all converge on `onComplete`, which the
                // parent uses to invalidate `usePlayerKyc()` and re-read
                // gates. Sumsub events arrive in bursts during a session and
                // are not cheap to disambiguate client-side, so we treat any
                // terminal-ish event as a hint to refresh and let the
                // backend decide the actual tier.
                const notifyRefresh = () => onComplete?.()

                instance = snsWebSdk
                    .init(tokenResult.token, async () => {
                        const refreshed = await tokenMutation.mutateAsync(targetTier)
                        return refreshed.token
                    })
                    // Pin the iframe origin to the backend-supplied host.
                    // Sumsub's access-token JWT embeds api.sumsub.com (their
                    // REST host) in its `url` claim, but static.sumsub.com's
                    // CORS only allows in.sumsub.com — without this override
                    // every CSS chunk the iframe pulls in is blocked.
                    .withBaseUrl(tokenResult.sdkBaseUrl)
                    .withConf({
                        lang: 'en',
                        theme: 'dark',
                        customizationName: 'Blockpot Customization',
                    })
                    .withOptions({
                        addViewportTag: false,
                        adaptIframeHeight: true,
                    })
                    .on('idCheck.onError', (payload) => {
                        const message = payload?.reason ?? payload?.error ?? 'Verification error'
                        console.error('[sumsub] idCheck.onError', payload)
                        onError?.(message)
                    })
                    .on('idCheck.onStepCompleted', notifyRefresh)
                    .on('idCheck.onApplicantSubmitted', notifyRefresh)
                    .on('idCheck.onApplicantStatusChanged', notifyRefresh)
                    .on('idCheck.onApplicantReviewComplete', notifyRefresh)
                    .on('idCheck.onApplicantLevelChanged', notifyRefresh)
                    .build()

                instance.launch(containerRef.current)
                setReady(true)
            } catch (e) {
                if (cancelled) return
                const message = e instanceof Error ? e.message : 'Unable to start verification'
                console.error('[sumsub] init failed', e)
                setError(message)
                onError?.(message)
            }
        }

        void init()

        return () => {
            cancelled = true
            try {
                instance?.destroy()
            } catch {
                // destroy is best-effort on unmount
            }
        }
    // targetTier and a Retry click are the only inputs that should re-init;
    // the mutation + callbacks are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetTier, attempt])

    if (error) {
        // The raw SDK / token error is logged above; players get plain copy.
        return (
            <InfoBanner
                tone='block'
                action={
                    <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => { setError(null); setReady(false); setAttempt((n) => n + 1) }}
                    >
                        Retry
                    </Button>
                }
            >
                We couldn&apos;t start verification. Try again or{' '}
                <a href={SUPPORT_URL} target='_blank' rel='noreferrer' className='underline'>contact support</a>.
            </InfoBanner>
        )
    }

    return (
        <div className='w-full min-h-[520px] relative'>
            {!ready && (
                <div className='absolute inset-0 flex items-center justify-center gap-2 text-sm text-gray-400' role='status'>
                    <Loader2 className='h-6 w-6 animate-spin' />
                    Loading verification…
                </div>
            )}
            <div ref={containerRef} className='w-full' />
        </div>
    )
}
