import { ApiError, authedFetch, getToken, isServiceConfigured } from './gamingServiceClient'

export type SessionBehavioral = {
    sessionStartedAt: string
    sessionId: string
    pagePath: string
    scrolls: number
    clicks: number
    entryCadence: string[] // ISO timestamps, capped client-side
    pageLoadedAt: string
}

export type SessionSignalPayload = {
    fingerprint_hash: string
    behavioral: SessionBehavioral
}

// Best-effort POST to /v1/session/signal. Sybil signal collection must never
// block the user — if the gaming service is unconfigured, no Bearer token is
// active, or the call fails for any reason, we swallow the error and let the
// next page load try again. The backend correlator runs every 5 minutes, so a
// single dropped beacon is irrelevant.
export async function postSessionSignal(payload: SessionSignalPayload): Promise<void> {
    if (!isServiceConfigured()) return
    if (!getToken()) return
    try {
        await authedFetch('/v1/session/signal', {
            method: 'POST',
            body: payload,
            expectEmpty: true,
        })
    } catch (e) {
        if (e instanceof ApiError && (e.status === 404 || e.status === 0)) return
        // Fire-and-forget: log once for observability, never throw.
        console.warn('[sessionSignal] non-fatal post failure', e)
    }
}
