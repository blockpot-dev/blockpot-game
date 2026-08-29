// Player-facing terminology. One term per thing (CLAUDE.md "Player-facing
// copy"); decided against the KB glossary in BLO-749. Change here, not inline.
export const TERM = {
    draw: 'Draw',
    pastDraws: 'Past draws',
    prizePool: 'Prize pool',
    mainGame: 'Main Game',
    quickGame: 'Quick Game',
    entry: 'Entry',
} as const

// "Draw 3 of 10"
export function drawOfLabel(n: number | string, m: number | string): string {
    return `${TERM.draw} ${n} of ${m}`
}

// "Prize pool #4"
export function prizePoolLabel(n: number | string | bigint): string {
    return `${TERM.prizePool} #${n}`
}
