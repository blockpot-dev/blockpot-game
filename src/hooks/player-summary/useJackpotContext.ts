import { useQuery } from '@tanstack/react-query'
import { authedFetch, isServiceConfigured } from '@/api/gamingServiceClient'
import { usePlayerSession } from '@/providers/PlayerSessionProvider'
import { PlayerTier } from './usePlayerActivityState'

export type JackpotContext = {
    currentJackpotEurMinor: number
    tierRequiredToFullyClaim: PlayerTier
}

// Wire shape — camelCase, matches httpapi/player_summary_handler.go.
type JackpotContextResponse = {
    currentJackpotEurMinor: number
    tierRequiredToFullyClaim: PlayerTier
}

// Storybook fallback ONLY: when the backend URL isn't configured, return a
// canned context so visual reviews see the pre-commit banner. The live site
// never hits this branch — it's gated on `isServiceConfigured()` AND the
// query is disabled until a SIWE session exists, so a fake "you need T2"
// signal can never leak into the persisted cache.
function buildMockContext(): JackpotContext {
    return {
        currentJackpotEurMinor: 5_000_00,
        tierRequiredToFullyClaim: 'T2',
    }
}

async function fetchJackpotContext(): Promise<JackpotContext> {
    if (!isServiceConfigured()) {
        return buildMockContext()
    }
    const body = await authedFetch<JackpotContextResponse>('/v1/player/jackpot-context')
    return {
        currentJackpotEurMinor: body.currentJackpotEurMinor,
        tierRequiredToFullyClaim: body.tierRequiredToFullyClaim,
    }
}

const POLL_INTERVAL_MS = 30_000

type Options = {
    enabled?: boolean
}

// `enabled` should reflect whether a draw window is open (i.e. the player is
// actually looking at /play and could enter). Parents toggle this so we don't
// burn cycles polling on unrelated routes.
//
// The query is also gated on a live SIWE session when the backend is
// configured — without this, the Storybook mock fallback above would run
// before SIWE, persist a "T2 required" stub to IndexedDB, and survive any
// transient backend error (TanStack Query keeps the previous data on error).
// That would light up the header attention dot for every fresh user.
export default function useJackpotContext({ enabled = true }: Options = {}) {
    const { activeToken } = usePlayerSession()
    const liveEnabled = isServiceConfigured() ? !!activeToken() : true

    const query = useQuery({
        queryKey: ['jackpotContext'],
        queryFn: fetchJackpotContext,
        enabled: enabled && liveEnabled,
        refetchInterval: POLL_INTERVAL_MS,
        refetchOnWindowFocus: true,
        staleTime: POLL_INTERVAL_MS / 2,
        retry: false,
    })

    return {
        context: query.data,
        isLoading: query.isLoading,
        error: query.error,
    }
}
