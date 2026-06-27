// Lightweight in-house fingerprint for the Sybil correlation engine.
//
// The backend stores only the hash, never the raw components, so the goal here
// is a stable, deterministic SHA-256 across the signals the kyc-implementation
// spec calls out: canvas, WebGL, screen, hardware concurrency, fonts, plus
// timezone / language / platform context. We deliberately skip audio
// fingerprinting (OfflineAudioContext is heavy and noisy) and rely on the
// backend's IP + funding-origin clustering to add confidence.
//
// Probabilistic by design — the correlator is the source of truth, this helper
// just feeds it.

const FONT_PROBE_LIST = [
    'Arial', 'Helvetica', 'Times', 'Courier New', 'Verdana', 'Georgia',
    'Comic Sans MS', 'Trebuchet MS', 'Impact', 'Tahoma',
    'Palatino', 'Garamond', 'Bookman', 'Avant Garde',
    'Monaco', 'Lucida Console', 'Geneva', 'Optima', 'Futura',
]
const FONT_BASELINE_FAMILIES = ['monospace', 'sans-serif', 'serif'] as const
const FONT_PROBE_TEXT = 'mmmmmmmmmmlli'
const FONT_PROBE_SIZE = '72px'

function safeCall<T>(fn: () => T, fallback: T): T {
    try {
        return fn()
    } catch {
        return fallback
    }
}

function canvasSignal(): string {
    return safeCall(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 280
        canvas.height = 60
        const ctx = canvas.getContext('2d')
        if (!ctx) return 'no-2d'
        ctx.textBaseline = 'top'
        ctx.font = '14px "Arial"'
        ctx.fillStyle = '#f60'
        ctx.fillRect(125, 1, 62, 20)
        ctx.fillStyle = '#069'
        ctx.fillText('Blockpot fingerprint ✨', 2, 15)
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
        ctx.fillText('Blockpot fingerprint ✨', 4, 17)
        return canvas.toDataURL()
    }, 'canvas-error')
}

function webglSignal(): string {
    return safeCall(() => {
        const canvas = document.createElement('canvas')
        const gl = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
        if (!gl) return 'no-webgl'
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
        const version = gl.getParameter(gl.VERSION)
        const shading = gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
        return `${vendor}|${renderer}|${version}|${shading}`
    }, 'webgl-error')
}

function fontsSignal(): string {
    return safeCall(() => {
        if (typeof document === 'undefined') return 'no-doc'
        const body = document.body
        if (!body) return 'no-body'
        const baselineSizes = new Map<string, { w: number; h: number }>()
        const probe = document.createElement('span')
        probe.style.position = 'absolute'
        probe.style.left = '-9999px'
        probe.style.top = '-9999px'
        probe.style.fontSize = FONT_PROBE_SIZE
        probe.style.lineHeight = 'normal'
        probe.style.visibility = 'hidden'
        probe.textContent = FONT_PROBE_TEXT
        body.appendChild(probe)
        try {
            for (const family of FONT_BASELINE_FAMILIES) {
                probe.style.fontFamily = family
                baselineSizes.set(family, {
                    w: probe.offsetWidth,
                    h: probe.offsetHeight,
                })
            }
            const detected: string[] = []
            for (const candidate of FONT_PROBE_LIST) {
                let isPresent = false
                for (const family of FONT_BASELINE_FAMILIES) {
                    probe.style.fontFamily = `'${candidate}', ${family}`
                    const { w, h } = baselineSizes.get(family)!
                    if (probe.offsetWidth !== w || probe.offsetHeight !== h) {
                        isPresent = true
                        break
                    }
                }
                if (isPresent) detected.push(candidate)
            }
            return detected.join(',')
        } finally {
            body.removeChild(probe)
        }
    }, 'fonts-error')
}

function screenSignal(): string {
    if (typeof window === 'undefined' || typeof screen === 'undefined') return 'no-screen'
    return [
        screen.width,
        screen.height,
        screen.availWidth,
        screen.availHeight,
        screen.colorDepth,
        window.devicePixelRatio,
    ].join('x')
}

function hardwareSignal(): string {
    if (typeof navigator === 'undefined') return 'no-nav'
    const nav = navigator as Navigator & { deviceMemory?: number }
    return [
        nav.hardwareConcurrency ?? '?',
        nav.deviceMemory ?? '?',
        nav.platform ?? '?',
        (nav.languages ?? []).join(',') || nav.language || '?',
    ].join('|')
}

function timezoneSignal(): string {
    return safeCall(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'no-tz', 'tz-error')
}

async function sha256Hex(input: string): Promise<string> {
    const subtle = globalThis.crypto?.subtle
    if (!subtle) {
        // Fallback DJB2 — not cryptographic, but deterministic and never used in
        // production browsers. Keeps the helper testable in environments that
        // strip SubtleCrypto (e.g. older jsdom).
        let hash = 5381
        for (let i = 0; i < input.length; i += 1) {
            hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0
        }
        return `djb2_${(hash >>> 0).toString(16).padStart(8, '0')}`
    }
    const bytes = new TextEncoder().encode(input)
    const digest = await subtle.digest('SHA-256', bytes)
    const view = new Uint8Array(digest)
    let hex = ''
    for (let i = 0; i < view.length; i += 1) {
        hex += view[i]!.toString(16).padStart(2, '0')
    }
    return hex
}

export type DeviceFingerprint = {
    fingerprintHash: string
    components: {
        canvasLength: number
        webgl: string
        fonts: string
        screen: string
        hardware: string
        timezone: string
        userAgent: string
    }
}

// Computes a stable per-device fingerprint hash. Resolves to a single SHA-256
// hex string suitable for posting to /v1/session/signal as `fingerprint_hash`.
// Raw component values stay client-side; only their byte-lengths are exposed
// in the returned `components` for debugging.
export async function computeDeviceFingerprint(): Promise<DeviceFingerprint> {
    const canvas = canvasSignal()
    const webgl = webglSignal()
    const fonts = fontsSignal()
    const screenStr = screenSignal()
    const hardware = hardwareSignal()
    const timezone = timezoneSignal()
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'no-ua'

    const composite = [
        `c:${canvas}`,
        `g:${webgl}`,
        `f:${fonts}`,
        `s:${screenStr}`,
        `h:${hardware}`,
        `t:${timezone}`,
        `u:${userAgent}`,
    ].join('||')

    const fingerprintHash = await sha256Hex(composite)
    return {
        fingerprintHash,
        components: {
            canvasLength: canvas.length,
            webgl,
            fonts,
            screen: screenStr,
            hardware,
            timezone,
            userAgent,
        },
    }
}
