export function max(a: bigint, b: bigint): bigint {
    if (a > b) { return a }
    return b
}

export function min(a: bigint, b: bigint): bigint {
    if (a < b) { return a }
    return b
}