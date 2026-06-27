import { useQuery } from '@tanstack/react-query'
import { isServiceConfigured, publicFetch } from '@/api/gamingServiceClient'

export type CurrentTos = {
    versionHash: string
    versionLabel: string
    bodyMarkdown: string
    effectiveFrom: string
}

type TosResponse = {
    version_hash: string
    version_label: string
    body_markdown: string
    effective_from: string
}

async function fetchCurrentTos(): Promise<CurrentTos> {
    const body = await publicFetch<TosResponse>('/v1/tos/current')
    return {
        versionHash: body.version_hash,
        versionLabel: body.version_label,
        bodyMarkdown: body.body_markdown,
        effectiveFrom: body.effective_from,
    }
}

// Loads the current TOS document from the gaming service. The response carries
// a stable keccak256 hash of the body bytes — that hash must round-trip through
// POST /v1/attestation so the server can reject stale clients with a 409 and
// force a re-fetch.
export default function useCurrentTos(enabled = true) {
    return useQuery({
        queryKey: ['tos', 'current'],
        queryFn: fetchCurrentTos,
        enabled: enabled && isServiceConfigured(),
        staleTime: 10 * 60 * 1000,
    })
}
