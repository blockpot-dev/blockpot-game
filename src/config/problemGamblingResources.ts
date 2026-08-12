// Jurisdiction-pluggable problem-gambling resources (B-RG-5, task 113).
// The target jurisdiction is a product/legal decision that has not been made
// yet (out of scope); switching it — or localizing the content — is a
// config-only change here, with no component edits.

export type ProblemGamblingResource = {
    name: string
    href: string
    region: string
    description: string
}

export type JurisdictionCode = 'international' | 'uk' | 'dk' | 'pt'

export const RESOURCES_BY_JURISDICTION: Record<JurisdictionCode, ProblemGamblingResource[]> = {
    // Pre-decision default: the full multi-region list the app has shipped so far.
    international: [
        {
            name: 'BeGambleAware',
            href: 'https://www.begambleaware.org/',
            region: 'UK / Isle of Man',
            description: 'Free, confidential support and treatment options.',
        },
        {
            name: 'Gamblers Anonymous',
            href: 'https://www.gamblersanonymous.org/',
            region: 'International',
            description: 'Peer fellowship for people recovering from problem gambling.',
        },
        {
            name: 'Spillemyndigheden — StopSpillet',
            href: 'https://www.stopspillet.dk/',
            region: 'Denmark',
            description: 'Danish helpline operated by the gambling authority.',
        },
        {
            name: 'Gordon Moody',
            href: 'https://www.gordonmoody.org.uk/',
            region: 'UK',
            description: 'Residential and online treatment for severe gambling addiction.',
        },
        {
            name: 'Jogo Remoto / SICAD',
            href: 'https://www.jogoremoto.pt/pt/jogo-responsavel/',
            region: 'Portugal',
            description: 'Portuguese self-help and clinical referral resources.',
        },
    ],
    uk: [
        {
            name: 'BeGambleAware',
            href: 'https://www.begambleaware.org/',
            region: 'UK / Isle of Man',
            description: 'Free, confidential support and treatment options.',
        },
        {
            name: 'Gordon Moody',
            href: 'https://www.gordonmoody.org.uk/',
            region: 'UK',
            description: 'Residential and online treatment for severe gambling addiction.',
        },
        {
            name: 'Gamblers Anonymous',
            href: 'https://www.gamblersanonymous.org/',
            region: 'International',
            description: 'Peer fellowship for people recovering from problem gambling.',
        },
    ],
    dk: [
        {
            name: 'Spillemyndigheden — StopSpillet',
            href: 'https://www.stopspillet.dk/',
            region: 'Denmark',
            description: 'Danish helpline operated by the gambling authority.',
        },
        {
            name: 'Gamblers Anonymous',
            href: 'https://www.gamblersanonymous.org/',
            region: 'International',
            description: 'Peer fellowship for people recovering from problem gambling.',
        },
    ],
    pt: [
        {
            name: 'Jogo Remoto / SICAD',
            href: 'https://www.jogoremoto.pt/pt/jogo-responsavel/',
            region: 'Portugal',
            description: 'Portuguese self-help and clinical referral resources.',
        },
        {
            name: 'Gamblers Anonymous',
            href: 'https://www.gamblersanonymous.org/',
            region: 'International',
            description: 'Peer fellowship for people recovering from problem gambling.',
        },
    ],
}

// Target jurisdiction is undecided — 'international' until product/legal picks one.
export const ACTIVE_JURISDICTION: JurisdictionCode = 'international'
