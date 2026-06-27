// Countries where Blockpot cannot accept players. The authoritative list lives
// in the gaming-service pre-tx gate (task 10); this frontend copy is used only
// for client-side short-circuiting of the attestation flow so the user does not
// submit an attestation the server will reject. Any change here MUST be mirrored
// server-side — mismatches silently fail the attestation and produce a 422.
//
// Contents:
// - US, AU — operator restriction.
// - KP (DPRK), IR (Iran), MM (Myanmar) — FATF "call for action" high-risk list.
export const BLOCKED_COUNTRY_CODES: readonly string[] = [
    'US',
    'AU',
    'KP',
    'IR',
    'MM',
] as const

export function isBlockedCountry(countryCode: string | null | undefined): boolean {
    if (!countryCode) return false
    return BLOCKED_COUNTRY_CODES.includes(countryCode.toUpperCase())
}
