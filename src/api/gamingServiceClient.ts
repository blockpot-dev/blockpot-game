import { Address } from 'viem'

// Single Bearer-token fetch client every player-session hook in src/hooks/**
// goes through. The token store is intentionally a module-level mirror of
// PlayerSessionProvider's React state so synchronous helpers like
// `evaluatePretxDeposit` (called from inside other hooks' write paths) can
// read the current token without subscribing to context.

export const SESSION_EXPIRED = 'SESSION_EXPIRED'
export const NO_SERVICE_URL = 'NO_SERVICE_URL'
export const NO_SESSION_TOKEN = 'NO_SESSION_TOKEN'
export const SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'

export type ApiErrorBody = { error?: { code?: string; message?: string } } | null

export type ApiErrorOptions = {
    status: number
    code: string
    message: string
    retryAfterSeconds?: number
}

export class ApiError extends Error {
    readonly status: number
    readonly code: string
    readonly retryAfterSeconds?: number
    constructor({ status, code, message, retryAfterSeconds }: ApiErrorOptions) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.retryAfterSeconds = retryAfterSeconds
    }
}

export type TokenSnapshot = {
    token: string
    address: Address
    chainId: number
    expiresAt: Date
}

let currentToken: TokenSnapshot | null = null
const expiryListeners = new Set<() => void>()

export function setToken(snapshot: TokenSnapshot): void {
    currentToken = snapshot
}

export function clearToken(): void {
    currentToken = null
}

// Returns the active snapshot or null when no token is held / it has expired.
// Also self-clears the expired snapshot so the next caller sees null.
export function getToken(): TokenSnapshot | null {
    if (!currentToken) return null
    if (currentToken.expiresAt.getTime() <= Date.now()) {
        currentToken = null
        return null
    }
    return currentToken
}

export function subscribeSessionExpired(listener: () => void): () => void {
    expiryListeners.add(listener)
    return () => {
        expiryListeners.delete(listener)
    }
}

function emitSessionExpired(): void {
    for (const listener of expiryListeners) {
        try {
            listener()
        } catch (e) {
            console.error('[gamingServiceClient] session-expiry listener threw', e)
        }
    }
}

export function isServiceConfigured(): boolean {
    return !!getServiceUrl()
}

function getServiceUrl(): string {
    return (import.meta.env.VITE_GAMING_SERVICE_URL as string | undefined)?.replace(/\/+$/, '') ?? ''
}

function requireServiceUrl(authed: boolean): string {
    const url = getServiceUrl()
    if (!url) {
        throw new ApiError({
            status: 0,
            code: NO_SERVICE_URL,
            message: authed
                ? 'VITE_GAMING_SERVICE_URL is not configured. Set it in .env.local before exercising authenticated player-session calls.'
                : 'VITE_GAMING_SERVICE_URL is not configured.',
        })
    }
    return url
}

type FetchRequestInit = Parameters<typeof fetch>[1]

export type GamingFetchInit = Omit<NonNullable<FetchRequestInit>, 'body' | 'headers'> & {
    body?: unknown
    headers?: Record<string, string>
    expectEmpty?: boolean
}

function parseRetryAfter(value: string | null): number | undefined {
    if (!value) return undefined
    const seconds = Number(value)
    if (Number.isFinite(seconds) && seconds >= 0) return seconds
    const date = Date.parse(value)
    if (Number.isNaN(date)) return undefined
    return Math.max(0, Math.round((date - Date.now()) / 1000))
}

async function safeJson(res: Response): Promise<ApiErrorBody> {
    try {
        return (await res.json()) as ApiErrorBody
    } catch {
        return null
    }
}

async function rawFetch<T>(authed: boolean, path: string, init: GamingFetchInit = {}): Promise<T> {
    const baseUrl = requireServiceUrl(authed)
    const headers: Record<string, string> = { ...(init.headers ?? {}) }

    let body: string | FormData | Blob | undefined
    if (init.body !== undefined && init.body !== null) {
        if (typeof init.body === 'string' || init.body instanceof FormData || init.body instanceof Blob) {
            body = init.body
        } else {
            if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
            body = JSON.stringify(init.body)
        }
    }

    if (authed) {
        const snapshot = getToken()
        if (!snapshot) {
            throw new ApiError({
                status: 0,
                code: NO_SESSION_TOKEN,
                message: 'No active player session; sign in via SIWE first.',
            })
        }
        headers['Authorization'] = `Bearer ${snapshot.token}`
    }

    const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers,
        body,
    })

    // Collapse the 401 → SIWE re-prompt path. Excluding /v1/auth/* avoids an
    // expiry loop when the verify call itself fails (the user simply gets the
    // verify error surfaced as-is).
    if (res.status === 401 && authed && !path.startsWith('/v1/auth/')) {
        clearToken()
        const errorBody = await safeJson(res)
        emitSessionExpired()
        throw new ApiError({
            status: 401,
            code: SESSION_EXPIRED,
            message: errorBody?.error?.message ?? 'Session expired; re-authenticate via SIWE.',
        })
    }

    if (res.status === 503) {
        const retryAfter = parseRetryAfter(res.headers.get('Retry-After'))
        const errorBody = await safeJson(res)
        throw new ApiError({
            status: 503,
            code: errorBody?.error?.code ?? SERVICE_UNAVAILABLE,
            message: errorBody?.error?.message ?? 'Service temporarily unavailable',
            retryAfterSeconds: retryAfter,
        })
    }

    if (!res.ok) {
        const errorBody = await safeJson(res)
        throw new ApiError({
            status: res.status,
            code: errorBody?.error?.code ?? `HTTP_${res.status}`,
            message: errorBody?.error?.message ?? `request failed (${res.status})`,
        })
    }

    if (init.expectEmpty || res.status === 204) {
        return undefined as T
    }
    const text = await res.text()
    if (!text) return undefined as T
    try {
        return JSON.parse(text) as T
    } catch {
        return text as unknown as T
    }
}

// Anonymous calls — nonce, verify, current TOS, operations polling.
export function publicFetch<T = unknown>(path: string, init?: GamingFetchInit): Promise<T> {
    return rawFetch<T>(false, path, init)
}

// Bearer-token calls — every endpoint behind the backend's PlayerSessionAuth
// middleware (/v1/attestation, /v1/players/register, /v1/kyc/*, /v1/pretx/*,
// /v1/self-exclusion/*, /v1/rg/*, /v1/player/*).
export function authedFetch<T = unknown>(path: string, init?: GamingFetchInit): Promise<T> {
    return rawFetch<T>(true, path, init)
}
