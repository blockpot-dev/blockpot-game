import { createFileRoute, Link } from '@tanstack/react-router'
import { Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'

export const Route = createFileRoute('/how-to-play')({
    component: HowToPlayPage,
})

type SectionMeta = { number: number, id: string, title: string }

const SECTIONS: SectionMeta[] = [
    { number: 1, id: 's1', title: 'What is a ticket?' },
    { number: 2, id: 's2', title: 'How draws work' },
    { number: 3, id: 's3', title: 'How payouts work' },
    { number: 4, id: 's4', title: 'Getting started' },
    { number: 5, id: 's5', title: 'Verification and tiers' },
    { number: 6, id: 's6', title: 'Responsible gaming' },
    { number: 7, id: 's7', title: 'Refunds' },
]

function NumberedSection({ number, id, title, children }: SectionMeta & { children: React.ReactNode }) {
    return (
        <section id={id} className='flex flex-col gap-3'>
            <h2 className='text-xl font-semibold text-foreground'>{number}. {title}</h2>
            <div className='text-sm text-secondary-foreground space-y-3'>{children}</div>
        </section>
    )
}

function TableOfContents() {
    return (
        <nav aria-label='On this page' className='flex flex-col gap-1'>
            {SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`} className='text-sm text-accent-foreground hover:underline'>
                    {s.number}. {s.title}
                </a>
            ))}
        </nav>
    )
}

function HowToPlayPage() {
    return (
        <div className='@container w-full flex-1'>
            <div className='@min-xs:max-w-[820px] mx-auto my-8 px-4'>
                <Container highlight highlightBottomBorderHidden>
                    <VStack className='gap-8'>
                        <div>
                            <h1 className='heading-4xl text-foreground'>How to play</h1>
                            <p className='text-sm text-secondary-foreground mt-2'>
                                Blockpot is a licensed prize draw operator, powered by Unipot Protocol — every entry is recorded on-chain, draws use verifiable Chainlink VRF randomness, and prizes settle to the wallet you played from.
                            </p>
                        </div>

                        <TableOfContents />

                        {/* PEA / CF mirrored from src/constants/protocol.ts; OF default mirrored from src/constants/operator.ts (VITE_OPERATOR_FEE_BPS). */}
                        <NumberedSection number={1} id='s1' title='What is a ticket?'>
                            <p>
                                Each ticket gives you one chance to win prizes in the current
                                round. Every ticket costs a fixed amount:
                            </p>
                            <ul className='list-disc pl-6 space-y-1'>
                                <li><strong>Entry amount</strong> — 0.001 ETH, goes to the prize pool.</li>
                                <li><strong>Protocol fee</strong> — 2% of the entry amount, routed to the protocol contributor on-chain.</li>
                                <li><strong>Operator fee</strong> — 5% of the entry amount, collected by the licensed operator that runs this site.</li>
                            </ul>
                            <p>
                                These are charged as two separate on-chain transactions; the
                                entry panel shows the totals before you confirm.
                            </p>
                        </NumberedSection>

                        <NumberedSection number={2} id='s2' title='How draws work'>
                            <p>
                                When the round timer reaches zero and enough tickets have been
                                sold, a draw is triggered. Random numbers are produced on-chain
                                using Chainlink VRF, which means no one — not the operator, not
                                any player, not the protocol — can influence the outcome.
                            </p>
                            <p>
                                Each drawn number maps back to a specific ticket. If one of your
                                tickets is drawn, you win the prize tier associated with that
                                draw slot.
                            </p>
                            <p>
                                A draw only fires once both conditions are met: the round timer
                                has reached zero <em>and</em> the round has reached its minimum
                                ticket threshold. If the minimum is not met by the timer, the
                                round extends until it is.
                            </p>
                        </NumberedSection>

                        {/* Claim semantics mirror src/hooks/claim/useClaimRequest.ts and src/components/blockpot/winnings/ClaimDecision.tsx. Per project memory and spec §7.6 / task 34, self-exclusion is not a control point on claims of already-earned winnings; sanctions/Sybil branches are intentionally not surfaced per spec §16. */}
                        <NumberedSection number={3} id='s3' title='How payouts work'>
                            <p>
                                When the round finalizes on-chain, your prize is escrowed
                                against your wallet. Claim it from the Account screen — claims
                                are usually processed within seconds, but may be paused if your
                                KYC tier does not yet cover the amount, or if your current
                                region is not supported. See{' '}
                                <Link to='/verify' className='text-accent-foreground hover:underline'>
                                    Verify your account
                                </Link>{' '}
                                to lift verification holds.
                            </p>
                            <p>
                                If a prize transfer fails for any reason (for example, a
                                contract address that cannot receive ETH), the prize is held in
                                an on-chain recovery contract and can be retrieved later.
                            </p>
                        </NumberedSection>

                        <NumberedSection number={4} id='s4' title='Getting started'>
                            <p>
                                A few one-time steps before your first entry:
                            </p>
                            <ol className='list-decimal pl-6 space-y-1'>
                                <li>
                                    Connect an EVM-compatible wallet from the top right —
                                    your tickets and winnings live at your wallet address, with
                                    no account to create and no password to remember.
                                </li>
                                <li>
                                    Sign the <em>Sign-In with Ethereum</em> message your wallet
                                    prompts for. This creates your Blockpot session — no email,
                                    no password, no transaction or gas required.
                                </li>
                                <li>
                                    Confirm your jurisdiction is supported. The region check is
                                    automatic; if you are in an unsupported region, entries and
                                    claims will be blocked.
                                </li>
                                <li>
                                    Accept the Terms of Service attestation on your first
                                    entry — confirms you are of legal gambling age and that
                                    play is legal where you reside.
                                </li>
                                <li>
                                    Start playing on a Tier 0 starter account. Verify your
                                    identity via{' '}
                                    <Link to='/verify' className='text-accent-foreground hover:underline'>
                                        Verify your account
                                    </Link>{' '}
                                    to raise your claim cap.
                                </li>
                            </ol>
                        </NumberedSection>

                        <NumberedSection number={5} id='s5' title='Verification and tiers'>
                            <p>
                                Blockpot uses a tiered KYC model. <strong>Tier 0</strong> is the
                                starter account — no verification, but claims of larger
                                winnings are capped. <strong>Tier 1 and above</strong> require
                                identity verification (and address verification past Tier 1)
                                and progressively raise the cap on what you can claim from a
                                single round. See{' '}
                                <Link to='/verify' className='text-accent-foreground hover:underline'>
                                    Verify your account
                                </Link>{' '}
                                to upgrade.
                            </p>
                        </NumberedSection>

                        <NumberedSection number={6} id='s6' title='Responsible gaming'>
                            <p>
                                Blockpot supports loss / stake limits and self-exclusion. Limits
                                are enforced before every entry; self-exclusion blocks new
                                entries for the period you choose but never blocks claims of
                                winnings you have already earned. Manage your settings on the{' '}
                                <Link to='/responsible-gaming' className='text-accent-foreground hover:underline'>
                                    Responsible gaming
                                </Link>{' '}
                                page.
                            </p>
                        </NumberedSection>

                        <NumberedSection number={7} id='s7' title='Refunds'>
                            <p>
                                Entries are final once the on-chain transaction confirms. The
                                protocol does not support refunds — please review the entry
                                breakdown before you confirm any transaction in your wallet.
                            </p>
                        </NumberedSection>
                    </VStack>
                </Container>
            </div>
        </div>
    )
}
