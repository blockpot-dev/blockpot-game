import { createFileRoute, Link } from '@tanstack/react-router'
import { Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import useEntryQuote from '@/hooks/contracts/operator/useEntryQuote'
import { BASIS_POINTS_DIVISOR, CF_BASIS_POINTS, PEA_PER_ENTRY_WEI } from '@/constants/protocol'
import { formatEtherMaxDecimalsGreedy } from '@/utilities/formatters'

export const Route = createFileRoute('/how-to-play')({
    component: HowToPlayPage,
})

type SectionMeta = { number: number, id: string, title: string }

const SECTIONS: SectionMeta[] = [
    { number: 1, id: 's1', title: 'What is an entry?' },
    { number: 2, id: 's2', title: 'How draws work' },
    { number: 3, id: 's3', title: 'How payouts work' },
    { number: 4, id: 's4', title: 'Getting started' },
    { number: 5, id: 's5', title: 'Verification' },
    { number: 6, id: 's6', title: 'Responsible gaming' },
    { number: 7, id: 's7', title: 'Refunds' },
]

const LINK_CLASS = 'text-accent-foreground hover:underline'

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
                <a key={s.id} href={`#${s.id}`} className={`text-sm ${LINK_CLASS}`}>
                    {s.number}. {s.title}
                </a>
            ))}
        </nav>
    )
}

// Percent of the entry amount, from wei figures. One decimal, trailing zero
// dropped ("2%", "2.5%").
function percentOf(part: bigint, whole: bigint): string {
    if (whole === 0n) return '—'
    const tenths = (part * 1000n + whole / 2n) / whole
    const s = (Number(tenths) / 10).toFixed(1).replace(/\.0$/, '')
    return `${s}%`
}

// Fee figures come from the operator's on-chain `entryQuote` for one entry.
// Until the quote resolves (or when no contract is configured for the current
// chain) the entry amount and protocol fee fall back to the constants the Draw
// core contract hardcodes (src/constants/protocol.ts); the operator fee is
// operator-set and has no static mirror, so it stays blank until it arrives.
function EntryFeeBreakdown() {
    const { quote } = useEntryQuote(1n)
    const live = quote.pea > 0n
    const pea = live ? quote.pea : PEA_PER_ENTRY_WEI
    const cfPercent = live
        ? percentOf(quote.cf, quote.pea)
        : percentOf(CF_BASIS_POINTS, BASIS_POINTS_DIVISOR)
    const opPercent = live ? percentOf(quote.opFee, quote.pea) : '—'

    return (
        <ul className='list-disc pl-6 space-y-1'>
            <li><strong>Entry amount</strong> — {formatEtherMaxDecimalsGreedy(pea, 6)} ETH, goes to the prize pool.</li>
            <li><strong>Protocol fee</strong> — {cfPercent} of the entry amount, paid to Unipot Protocol.</li>
            <li><strong>Operator fee</strong> — {opPercent} of the entry amount, paid to Blockpot, the operator that runs this site.</li>
        </ul>
    )
}

export function HowToPlayPage() {
    return (
        <div className='@container w-full flex-1'>
            <div className='@min-xs:max-w-[820px] mx-auto my-8 px-4'>
                <Container highlight highlightBottomBorderHidden>
                    <VStack className='gap-8'>
                        <div>
                            <h1 className='heading-4xl text-foreground'>How to play</h1>
                            <p className='text-sm text-secondary-foreground mt-2'>
                                Enter a draw. Check the result yourself. Every entry, draw
                                and payout is on-chain —{' '}
                                <Link to='/transparency' className={LINK_CLASS}>see the proof</Link>.
                                Prizes are escrowed to the wallet you entered from and you
                                claim them. Blockpot is an operator powered by Unipot Protocol.
                            </p>
                        </div>

                        <TableOfContents />

                        <NumberedSection number={1} id='s1' title='What is an entry?'>
                            <p>
                                Each entry is one chance at a prize in the current draw.
                                Every entry costs a fixed amount, made up of three parts:
                            </p>
                            <EntryFeeBreakdown />
                            <p>
                                All three are paid in one on-chain transaction and split by
                                the contract. If you pay with WETH, your wallet may first ask
                                you to approve the amount. The entry panel shows the total
                                before you confirm.
                            </p>
                        </NumberedSection>

                        <NumberedSection number={2} id='s2' title='How draws work'>
                            <p>
                                When the timer hits zero and the minimum entries are in, the
                                draw runs. If the minimum is not met by the timer, the draw
                                extends until it is. The random number comes from Chainlink
                                VRF and is recorded on-chain — nobody, including Blockpot,
                                can influence it.{' '}
                                <Link to='/transparency' className={LINK_CLASS}>Check any draw</Link>.
                            </p>
                            <p>
                                Each drawn number maps back to a specific entry. If one of
                                your entries is drawn, the prize for that draw slot is yours.
                            </p>
                        </NumberedSection>

                        {/* Claim semantics mirror src/hooks/claim/useClaimRequest.ts and the claim decision component. Self-exclusion and other responsible-gaming controls are never a control point on claims. */}
                        <NumberedSection number={3} id='s3' title='How payouts work'>
                            <p>
                                When the draw finalises on-chain, your prize is escrowed to
                                your wallet. Claim it from your Account. Some claims need
                                identity verification first —{' '}
                                <Link to='/verify' className={LINK_CLASS}>verify your identity</Link>{' '}
                                to release them.
                            </p>
                            <p>
                                If a prize transfer fails for any reason (for example, a
                                contract address that cannot receive ETH), the prize stays
                                escrowed on-chain and you can claim it later from your
                                Account.
                            </p>
                        </NumberedSection>

                        <NumberedSection number={4} id='s4' title='Getting started'>
                            <p>
                                A few one-time steps before your first entry:
                            </p>
                            <ol className='list-decimal pl-6 space-y-1'>
                                <li>
                                    Connect an EVM-compatible wallet from the top right —
                                    your entries and prizes live at your wallet address, with
                                    no account to create and no password to remember.
                                </li>
                                <li>
                                    Sign the <em>Sign-In with Ethereum</em> message your wallet
                                    prompts for. This creates your Blockpot session — no email,
                                    no password, no transaction or gas required.
                                </li>
                                <li>
                                    Confirm your region is supported. The check is automatic;
                                    if you are in an unsupported region, entries and claims
                                    are not available.
                                </li>
                                <li>
                                    Accept the Terms and Conditions on your first entry — this
                                    confirms you are old enough to enter and that entering is
                                    legal where you live.
                                </li>
                                <li>
                                    Enter straight away. Identity verification is only asked
                                    for when a prize needs it — see{' '}
                                    <Link to='/verify' className={LINK_CLASS}>Verify your identity</Link>.
                                </li>
                            </ol>
                        </NumberedSection>

                        <NumberedSection number={5} id='s5' title='Verification'>
                            <p>
                                Some prizes need identity verification before they can be
                                claimed. When a prize needs it, we tell you at the point of
                                claiming; your prize stays escrowed and waiting until
                                verification completes. You can also start early at{' '}
                                <Link to='/verify' className={LINK_CLASS}>Verify your identity</Link>.
                            </p>
                        </NumberedSection>

                        <NumberedSection number={6} id='s6' title='Responsible gaming'>
                            <p>
                                Blockpot supports loss limits and self-exclusion. Limits are
                                checked before every entry; self-exclusion blocks new entries
                                for the period you choose but never blocks claiming prizes
                                you&apos;ve been awarded. Manage your settings on the{' '}
                                <Link to='/responsible-gaming' className={LINK_CLASS}>Responsible gaming</Link>{' '}
                                page.
                            </p>
                        </NumberedSection>

                        <NumberedSection number={7} id='s7' title='Refunds'>
                            <p>
                                Entries are final once confirmed on-chain. Blockpot does not
                                offer refunds on entries. If an account is closed for
                                compliance reasons, you&apos;re returned to a net-zero position
                                as described in our{' '}
                                <Link to='/terms' className={LINK_CLASS}>terms</Link>.
                            </p>
                        </NumberedSection>
                    </VStack>
                </Container>
            </div>
        </div>
    )
}
