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

// "Any Winner" replacement (BLO-750). `chanceBps` is the contract's
// `DrawRound.chance` / `chanceOfWinner`: the probability, in basis points,
// that a drawn number lands on an entry. The first number drawn pays the top
// prize, so this is exactly the chance the top prize is paid this draw.
export const TERM_TOP_PRIZE_ODDS = 'Top prize odds'
export function topPrizeOddsDescription(formattedPercent: string): string {
    return `Chance that the top prize is paid in this draw: ${formattedPercent}`
}
