import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'

export const Route = createFileRoute('/terms')({
    component: TermsPage,
})

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <VStack className='gap-3'>
            <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
            <div className='text-sm text-secondary-foreground space-y-3'>{children}</div>
        </VStack>
    )
}

function TermsPage() {
    return (
        <div className='@container w-full'>
            <div className='@min-xs:max-w-[820px] mx-auto my-8 px-4'>
                <Container highlight highlightBottomBorderHidden>
                    <VStack className='gap-8'>
                        <h1 className='heading-4xl text-foreground'>Terms and Conditions</h1>
                        <p className='text-sm text-secondary-foreground'>
                            Effective 29 August 2026 · Version 1.0
                        </p>

                        <Section title='1. Who we are and what these Terms cover'>
                            <p>
                                1.1. The Blockpot service provided through this website and our related
                                sites (the &ldquo;Service&rdquo;) is operated by <strong>3-102-967838 S.R.L.</strong>,
                                a limited liability company (sociedad de responsabilidad limitada)
                                incorporated in Costa Rica whose legal name is its corporate
                                identification number, cédula jurídica 3-102-967838, with its registered
                                address at Avenida Escazú, Torre 102, Oficina 203-C, San José, San
                                José 10203, Costa Rica, trading as <strong>Blockpot</strong> (&ldquo;Blockpot&rdquo;,
                                &ldquo;we&rdquo;, &ldquo;us&rdquo;).
                            </p>
                            <p>
                                1.2. Blockpot is an operator of blockchain-based prize draws. Draws run
                                on <strong>Unipot Protocol</strong>, a set of immutable smart contracts deployed
                                on Base, an Ethereum layer-2 network. Blockpot uses Unipot Protocol
                                under a technology services agreement with its legal steward; Blockpot
                                does not own or control the protocol, and no party — Blockpot
                                included — can alter a draw, its odds, or its winner selection, or
                                reduce its prize pool, once entries open.
                            </p>
                            <p>
                                1.3. These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and
                                use of the Service, including every draw you enter through it. They
                                form a binding agreement between you (&ldquo;you&rdquo;, the &ldquo;player&rdquo;) and
                                Blockpot. The following are incorporated into these Terms by reference:
                                the rules of each draw as published on the Service; our Privacy Policy
                                and Cookie Policy; and any specific conditions stated to apply to a
                                particular draw or feature.
                            </p>
                            <p>
                                1.4. You accept these Terms by ticking the acceptance box during
                                registration. If you do not agree to these Terms in full, do not
                                register and do not use the Service.
                            </p>
                            <p>
                                1.5. Participating in prize draws involves risk of loss. By using the
                                Service you confirm you understand that the amounts you pay to enter
                                draws may be lost, and that entering is recreation, not a way to make
                                money or an investment of any kind.
                            </p>
                            <p>
                                1.6. Only the English version of these Terms is legally binding.
                                Translations, where provided, are for convenience.
                            </p>
                        </Section>

                        <Section title='2. Changes to these Terms'>
                            <p>
                                2.1. We may amend these Terms. The current version, its version number,
                                and its effective date are always published on this page. Material
                                changes take effect no earlier than 14 days after we publish them and
                                show a notice in the Service, except that changes required by law, by
                                a regulatory authority, or to Schedule A take effect on publication.
                                Section 3.3 is not amended when the law of a place changes: its effect
                                follows that law as the law stands at the relevant time, so no
                                publication and no notice period apply to it.
                            </p>
                            <p>
                                2.2. Your continued use of the Service after a new version takes effect
                                is acceptance of it. If you do not accept an updated version, stop
                                entering draws. You can always claim prizes you have already won, and
                                your escrowed winnings remain claimable regardless of whether you
                                accept updated Terms.
                            </p>
                        </Section>

                        <Section title='3. Eligibility'>
                            <p>3.1. You may register and use the Service only if all of the following are true:</p>
                            <ul className='list-disc pl-5 space-y-1'>
                                <li>
                                    you are at least 18 years old, or older where the law of your
                                    jurisdiction sets a higher minimum age for participating in prize
                                    draws or games of chance — whichever is greater;
                                </li>
                                <li>
                                    you are not located in, resident in, or accessing the Service from
                                    an Excluded Territory (Schedule A), and you are not otherwise
                                    ineligible under Section 3.3;
                                </li>
                                <li>
                                    you are not a national of the Republic of Korea (South Korea),
                                    regardless of where you live. South Korean law exposes its
                                    nationals to prosecution for participating in games of chance
                                    abroad, and we exclude them for their protection and ours;
                                </li>
                                <li>
                                    neither you nor the wallet you connect is subject to sanctions
                                    administered by the UN, OFAC, the EU, the UK, or any similar
                                    authority;
                                </li>
                                <li>you have full legal capacity to enter a binding contract;</li>
                                <li>
                                    you are acting for yourself, in a personal and recreational
                                    capacity, and not on behalf of any other person or for any business
                                    purpose;
                                </li>
                                <li>
                                    you are not an employee, contractor, or key person of Blockpot or of
                                    any entity involved in developing or stewarding Unipot Protocol, nor
                                    an immediate family member of one.
                                </li>
                            </ul>
                            <p>
                                3.2. <strong>We determine your location; you must not manipulate it.</strong>{' '}
                                Eligibility is assessed on your resolved location, derived from
                                technical signals. Using a VPN, proxy, or any other tool to disguise
                                your location in order to access the Service from an Excluded Territory,
                                or from any place within Section 3.3(a), is a material breach of these
                                Terms. If a verification document later shows you are resident in an
                                Excluded Territory, or that you are ineligible under Section 3.3, your
                                account will be closed under Section 11 even if technical checks passed
                                at the time.
                            </p>
                            <p>
                                3.3. <strong>Eligibility beyond Schedule A.</strong>
                            </p>
                            <ul className='list-disc pl-5 space-y-1'>
                                <li>
                                    <strong>(a)</strong> Schedule A lists the territories we exclude
                                    outright. It is not the limit of ineligibility. You are also
                                    ineligible to register, to enter, and to claim if, at the relevant
                                    time, you are located in, resident in, or accessing the Service from
                                    any place where <strong>(i)</strong> your participation in the
                                    Service is unlawful for you, or <strong>(ii)</strong> our provision
                                    of the Service to you would require a licence, registration,
                                    authorisation, or permit that Blockpot does not hold.
                                </li>
                                <li>
                                    <strong>(b)</strong> Whether (a) applies is determined by your
                                    resolved location under Section 3.2 and by the law of that place. We
                                    do not publish a list of places within (a): it changes, and the
                                    absence of a place from Schedule A is not a statement that you are
                                    eligible there.
                                </li>
                                <li>
                                    <strong>(c)</strong> Using a VPN, proxy, or any other tool,
                                    technique, or arrangement to conceal, alter, or misrepresent your
                                    location, or giving false or misleading information about your
                                    residence or nationality, is a breach of these Terms in itself,
                                    whether or not you turn out to be ineligible.
                                </li>
                                <li>
                                    <strong>(d)</strong> If we determine that you were ineligible under
                                    this Section 3.3, or that you have breached (c), we will close your
                                    account and resolve the closure under Sections 11.3 to 11.5: you are
                                    returned exactly the amount that brings your lifetime position to
                                    net zero, all escrowed or unclaimed value beyond that amount is
                                    reinjected into the prize pool, and Blockpot retains nothing. The
                                    full-forfeit rule in Section 11.4 applies only to sanctions matches
                                    under Section 9, never to ineligibility or breach under this
                                    Section 3.3.
                                </li>
                                <li>
                                    <strong>(e)</strong> Nothing in this Section 3.3 makes any Excluded
                                    Territory eligible, and nothing in Schedule A limits this
                                    Section 3.3.
                                </li>
                            </ul>
                            <p>
                                3.4. It is your responsibility to ensure that using the Service is
                                lawful where you are. We make no representation that the Service is
                                lawful in any particular place, and access to the Service does not
                                imply that it is.
                            </p>
                            <p>
                                3.5. We may amend Schedule A at any time to reflect legal developments.
                                Amendments apply immediately on publication. If a territory you are in
                                becomes an Excluded Territory, or if you become ineligible under
                                Section 3.3 because the law of the place you are in changes or because
                                we can no longer lawfully provide the Service to you there, Section 11
                                governs what happens to your account. You are not treated as having
                                breached these Terms where your ineligibility arises only from such a
                                change.
                            </p>
                            <p>
                                3.6. <strong>One account per person.</strong> Opening or attempting to operate
                                more than one account is a breach of these Terms and may result in all
                                your accounts being closed under Section 11.
                            </p>
                        </Section>

                        <Section title='4. Your wallet and your account'>
                            <p>
                                4.1. <strong>Blockpot is non-custodial.</strong> You participate directly from a
                                blockchain wallet that you own and control. There is no Blockpot
                                balance to deposit into and none to withdraw from: money you use to
                                enter draws moves from your wallet to the on-chain prize pools,
                                allocated between the current draw and future draws as the published
                                draw rules describe, and prizes are held in an on-chain escrow
                                contract, assigned to your wallet, until you claim them to that wallet.
                                We never hold your funds in any account of ours.
                            </p>
                            <p>
                                4.2. To register you provide: a wallet connection with proof that you
                                control it (a signed message), your date of birth, and your acceptance
                                of these Terms. Registration is refused if the checks described in
                                Section 3 do not pass.
                            </p>
                            <p>
                                4.3. <strong>You are solely responsible for your wallet.</strong> That includes
                                safeguarding your private keys and recovery phrase, every transaction
                                signed from your wallet, and the consequences of losing access to it.
                                We cannot reverse blockchain transactions, restore lost keys, or
                                recover funds sent to the wrong address. If your keys are compromised,
                                anything an attacker does with your wallet is attributable to you until
                                you notify us and we are reasonably able to restrict the account.
                            </p>
                            <p>
                                4.4. Your account links your wallet(s) to your registration and, where
                                applicable, your verified identity. You must keep your information
                                true, complete, and current, and tell us without undue delay — and at
                                the latest within 5 days — of any change.
                            </p>
                            <p>
                                4.5. Accounts are personal. You must not sell, lend, or transfer your
                                account or wallet access to anyone, or use an account or wallet
                                belonging to someone else.
                            </p>
                        </Section>

                        <Section title='5. Draws, entries, and prizes'>
                            <p>
                                5.1. Each draw&rsquo;s rules — entry price, entry limits, schedule, odds,
                                and prize structure — are published on the Service and in the on-chain
                                contract parameters. The on-chain parameters are definitive. Where any
                                description on the Service differs from the deployed contract, the
                                contract governs.
                            </p>
                            <p>
                                5.2. <strong>Entering.</strong> You enter a draw by submitting a transaction from
                                your registered wallet for the stated entry price, plus the network
                                transaction fee, which is set by the blockchain and not by us. An entry
                                is final once the transaction is confirmed on-chain. Entries cannot be
                                cancelled, changed, or refunded, except where a draw is void under
                                Section 14.
                            </p>
                            <p>
                                5.3. <strong>Winner selection.</strong> Winners are selected using Chainlink VRF
                                (Verifiable Random Function), which produces a random value together
                                with a cryptographic proof that it was not manipulated. Selection and
                                prize settlement run automatically in the smart contracts. Nobody —
                                including us — can influence, predict, or re-run the outcome of a draw.
                            </p>
                            <p>
                                5.4. <strong>You can check every draw yourself.</strong> Each draw&rsquo;s entries,
                                random seed, proof, winner selection, and settlement are recorded
                                on-chain, and the Service links each result to the underlying
                                transactions. You do not need to trust our reporting; the chain is the
                                record, and it has absolute evidential priority over any other source
                                in the event of a dispute about an outcome.
                            </p>
                            <p>
                                5.5. <strong>Fees.</strong> Fees are additive to the entry price, in the way a
                                sales tax is: the full entry price funds the prize pools — allocated
                                between the current draw and future draws as the published draw rules
                                describe — and two fees are charged on top of it: (a) a Unipot Protocol
                                fee of 2% of the entry price, which the protocol routes to the company
                                that develops and maintains it and which we do not receive; and (b) a
                                Blockpot operator fee of 5% of the entry price, which we receive. An
                                entry priced at 0.001 ETH therefore costs 0.00107 ETH in total, of
                                which 0.001 ETH goes to the prize pools. The total cost, with fees
                                itemised, is shown before you confirm an entry, and the fee parameters
                                are recorded on-chain, where you can verify them.
                            </p>
                            <p>
                                5.6. We may add, suspend, or retire draw formats at any time.
                                Suspension or retirement never affects a draw whose entries are open —
                                a draw that has taken entries always settles on-chain according to its
                                rules.
                            </p>
                            <p>
                                5.7. Entries are only possible with funds from your own wallet, and by
                                entering you warrant the funds are yours and lawfully obtained.
                            </p>
                        </Section>

                        <Section title='6. Claims'>
                            <p>
                                6.1. Prizes are held in on-chain escrow, assigned to the winning
                                wallet. You <strong>claim</strong> a prize by submitting a claim transaction from
                                your wallet; the smart contract pays it directly to that wallet. You
                                pay the network fee for the claim transaction.
                            </p>
                            <p>
                                6.2. There is no deadline for claims. Escrowed prizes remain claimable
                                indefinitely, subject only to Sections 7 to 9 and 11.
                            </p>
                            <p>
                                6.3. <strong>Until you have verified your identity</strong>, prizes can be claimed
                                only back to a wallet you have entered from, and cumulative claims to
                                that wallet cannot exceed the limits we apply (see Section 8.1). After
                                verification, you may register additional claim wallets, subject to the
                                checks in Section 9.
                            </p>
                            <p>
                                6.4. <strong>Responsible-play controls never block a claim.</strong> If you have
                                self-excluded or reached a limit you set under Section 10, you can
                                still claim any prize you have already won. Only the compliance checks
                                in Sections 8, 9, and 11 can pause or restrict a claim.
                            </p>
                            <p>
                                6.5. <strong>Taxes.</strong> You are responsible for any tax due on prizes you
                                claim; we do not withhold or report on your behalf unless the law
                                requires it.
                            </p>
                        </Section>

                        <Section title='7. Pending prizes'>
                            <p>
                                7.1. If you win a prize that exceeds what your current verification
                                level allows you to claim, the prize is not lost and not reduced. It is
                                handled in two parts, automatically, at the moment of the win: (a) an
                                amount equal to your <strong>net losses</strong> — everything you have paid to
                                enter draws, minus everything you have already claimed, measured in EUR
                                at the recorded rates (Section 9.5) — is paid to your wallet
                                immediately, up to the claim limit that applies to your account at that
                                moment; and (b) the remainder, including any part of your net losses
                                above that limit, is held in escrow, safe and assigned to you, and is
                                released when you complete the identity verification the Service asks
                                of you.
                            </p>
                            <p>
                                7.2. While a prize is pending under this Section, no other self-service
                                claims are possible on your account until the verification completes or
                                we resolve the hold.
                            </p>
                            <p>
                                7.3. A pending prize is released only to a verified account. If you
                                choose not to verify within the period stated in the verification
                                request, the account is closed under Section 11 and the closure rules
                                apply.
                            </p>
                        </Section>

                        <Section title='8. Identity verification'>
                            <p>
                                8.1. You can register and start entering draws with only the
                                information in Section 4.2. Identity verification becomes mandatory
                                when your activity requires it — for example when your cumulative
                                activity or a prize crosses thresholds we apply, when you ask to claim
                                to a new wallet, or where we are required to verify you by law. The
                                Service tells you at the moment verification is required, and the
                                action that triggered it resumes once verification completes. We may in
                                future require every account to complete identity verification before
                                entering further draws; we will give at least 30 days&rsquo; notice in the
                                Service before that requirement takes effect, and it will not affect
                                your ability to claim prizes you have already won.
                            </p>
                            <p>
                                8.2. Verification is performed through our identity-verification
                                provider (currently Sumsub). Depending on the check, you may be asked
                                for: government-issued photo ID; a live selfie; proof of address; and
                                information or documentation on your source of funds or wealth.
                                Documents must be genuine, legible, and current. Our Privacy Policy
                                describes how this data is handled.
                            </p>
                            <p>
                                8.3. You must complete a requested verification within the timeframe
                                stated in the request. Failing to do so may result in the triggering
                                action remaining unavailable, and, where Section 7.3 applies, in
                                account closure.
                            </p>
                            <p>
                                8.4. We may re-verify you, or request additional documentation, at any
                                time where required by law or by our risk-management obligations.
                            </p>
                            <p>
                                8.5. Providing false, altered, or someone else&rsquo;s documents or
                                information is a material breach of these Terms and grounds for
                                immediate closure under Section 11 and, where applicable, reporting to
                                authorities.
                            </p>
                            <p>
                                8.6. If you are or become a politically exposed person (PEP), a family
                                member of one, or a close associate of one, you must tell us promptly.
                                PEP status does not exclude you from the Service; it subjects you to
                                enhanced verification.
                            </p>
                        </Section>

                        <Section title='9. Anti-money-laundering and sanctions checks'>
                            <p>
                                9.1. We are committed to preventing the Service being used for money
                                laundering, terrorist financing, sanctions evasion, fraud, or any other
                                illicit purpose, and we operate screening and monitoring measures
                                designed to detect and deter such use.
                            </p>
                            <p>
                                9.2. Every entry and every claim is screened against sanctions data at
                                the contract level (currently via Chainalysis), and connected wallets
                                are re-screened daily. A wallet that fails screening is refused: its
                                entries do not proceed and its claims do not proceed.
                            </p>
                            <p>
                                9.3. We may pause a claim, or decline an entry, while we complete
                                checks that the law or our compliance obligations require. We complete
                                such checks without undue delay.
                            </p>
                            <p>
                                9.4. We report suspicious activity to the relevant authorities where
                                required, and we may do so without notifying you where notification is
                                prohibited.
                            </p>
                            <p>
                                9.5. For compliance purposes, all activity on your account is measured
                                in EUR at the exchange rate recorded at the time of each transaction,
                                using an independent on-chain price feed. These recorded values — not
                                later market movements — are the basis for the limits, thresholds, and
                                returns described in these Terms.
                            </p>
                        </Section>

                        <Section title='10. Responsible play'>
                            <p>
                                10.1. Prize draws are entertainment. They are not a way to make money,
                                and entry fees you pay are not an investment. Never enter with money
                                you cannot afford to lose, do not chase losses, and keep the time and
                                money you spend within limits you set deliberately.
                            </p>
                            <p>10.2. The Service provides tools to help you stay in control:</p>
                            <ul className='list-disc pl-5 space-y-1'>
                                <li>
                                    <strong>Stake and loss limits</strong> — caps you set on what you can spend or
                                    lose over a period. Setting a limit, or lowering one, takes effect
                                    immediately. Raising or removing a limit takes effect only after a
                                    7-day cooling-off period, and only if you confirm the request again
                                    once the period ends.
                                </li>
                                <li>
                                    <strong>Reality checks</strong> — periodic in-session reminders of how long you
                                    have been playing and your session activity.
                                </li>
                                <li>
                                    <strong>Self-exclusion</strong> — you may exclude yourself for 1, 3, 6, or 12
                                    months, or permanently. While excluded you cannot enter draws, you
                                    will not receive marketing from us, and you must not attempt to
                                    open another account. Self-exclusion cannot be shortened or
                                    cancelled once set; a timed exclusion lapses only when its period
                                    ends, and a permanent exclusion is not reversible.
                                </li>
                            </ul>
                            <p>
                                10.3. Self-exclusion and limits restrict entering. They never restrict
                                claiming: prizes you have already won remain claimable throughout
                                (Section 6.4).
                            </p>
                            <p>
                                10.4. If you are concerned about your play, free and confidential
                                support is available worldwide from Gambling Therapy
                                (gamblingtherapy.org, multilingual online support) and Gamblers
                                Anonymous (gamblersanonymous.org). If you tell us you have a problem
                                with your play, we will apply self-exclusion and will not respond with
                                promotional content.
                            </p>
                        </Section>

                        <Section title='11. Account closure and what you get back'>
                            <p>
                                11.1. <strong>You can close your account at any time</strong> in your account
                                settings or by emailing support@blockpot.com. Escrowed prizes remain
                                claimable per Section 6 before closure completes; funds never held by
                                us cannot be &ldquo;returned&rdquo; by us — your wallet remains yours. If you
                                close your account while a prize is pending under Section 7 and you
                                have not completed verification, the closure is treated as a failure to
                                verify under Section 7.3 and the return rule in Section 11.3 applies.
                            </p>
                            <p>
                                11.2. <strong>We close accounts for compliance reasons</strong> where these Terms
                                or the law require it, including: residence in an Excluded Territory
                                coming to light, ineligibility under Section 3.3 coming to light, a
                                South Korean passport surfacing at verification,
                                failure to verify within the window in Section 7.3, sanctions matches,
                                and material breach of these Terms (including the prohibited practices
                                in Section 12).
                            </p>
                            <p>
                                11.3. <strong>The return rule.</strong> When we close your account for any reason
                                under Section 11.2 — a compliance reason or a material breach alike —
                                you are returned exactly the amount that brings your lifetime position
                                to net zero, measured in the EUR values recorded under Section 9.5:
                                everything you paid in entry fees, minus everything you have already
                                received back in claims and payments. Concretely: (a) if your lifetime
                                position is a net loss, that net loss is paid to your wallet; (b) if
                                your lifetime position is net positive — you have already received at
                                least as much as you paid — nothing further is paid; (c) all escrowed
                                or unclaimed value beyond the returned amount is reinjected into the
                                prize pool of a current or future draw. It is never retained by us as
                                revenue.
                            </p>
                            <p>
                                11.4. <strong>Sanctions exception.</strong> Where your wallet or you are subject
                                to sanctions, we are prohibited from paying you anything. No return is
                                made, and the full escrowed value is reinjected into the prize pool.
                            </p>
                            <p>
                                11.5. The principle behind 11.3 and 11.4 is that we do not profit from
                                closing an account — not that a person we are prohibited from serving
                                is paid out. The return rule is not a reward for breach: value
                                extracted by exploiting an error remains recoverable as a debt under
                                Section 12.3, and the sanctions exception in 11.4 always prevails.
                            </p>
                        </Section>

                        <Section title='12. Prohibited practices'>
                            <p>12.1. The following are material breaches of these Terms:</p>
                            <ul className='list-disc pl-5 space-y-1'>
                                <li>providing false or incomplete information at registration or verification;</li>
                                <li>using stolen identity information, or a wallet you do not control;</li>
                                <li>
                                    entering from, or manipulating your location to appear outside, an
                                    Excluded Territory;
                                </li>
                                <li>operating more than one account, or colluding with other players;</li>
                                <li>
                                    using bots, scripts, or automated means to enter draws or interact
                                    with the Service, other than signing transactions from your own
                                    wallet by ordinary means;
                                </li>
                                <li>
                                    attempting to interfere with the Service, the smart contracts, or
                                    the draw process, including exploiting any error or vulnerability
                                    rather than reporting it;
                                </li>
                                <li>
                                    using the Service to launder money, evade sanctions, or otherwise
                                    break the law;
                                </li>
                                <li>
                                    using the Service for any commercial purpose, including reselling
                                    entries or acting as an agent for others.
                                </li>
                            </ul>
                            <p>
                                12.2. On reasonable suspicion of a prohibited practice we may suspend
                                the account while we investigate, decline entries, pause claims per
                                Section 9.3, close the account under Section 11, and report to
                                authorities. Because draws settle on-chain, a win already settled by
                                the contract is handled per Section 11&rsquo;s return rule rather than
                                &ldquo;voided&rdquo;.
                            </p>
                            <p>
                                12.3. If you find an error or vulnerability in the Service or its
                                contracts, report it to support@blockpot.com with the subject
                                &ldquo;Security&rdquo; and do not exploit it. Value extracted by exploiting an
                                error is recoverable as a debt.
                            </p>
                        </Section>

                        <Section title='13. The blockchain: risks you accept'>
                            <p>
                                13.1. By using a blockchain-based service you accept risks that no
                                operator can remove, including:
                            </p>
                            <ul className='list-disc pl-5 space-y-1'>
                                <li>
                                    <strong>Irreversibility</strong> — confirmed transactions cannot be undone by
                                    anyone.
                                </li>
                                <li>
                                    <strong>Network conditions</strong> — congestion and fee volatility can delay
                                    or price up your transactions; the network fee is never ours and
                                    never refundable by us.
                                </li>
                                <li>
                                    <strong>Your keys, your responsibility</strong> — anyone with your keys is, to
                                    the blockchain, you.
                                </li>
                                <li>
                                    <strong>Asset volatility</strong> — the market value of ETH can change at any
                                    time; entries are paid in ETH or wrapped ETH (wETH), and prizes are
                                    denominated and paid the same way, whatever their value in your
                                    local currency at claim time.
                                </li>
                                <li>
                                    <strong>Smart-contract and infrastructure risk</strong> — the Unipot Protocol
                                    contracts that run draws are immutable and their source code is
                                    published for anyone to verify; the Blockpot operator contracts
                                    that apply our compliance rules and hold prizes in escrow pending
                                    claim are upgradeable by us, so that those rules can change with
                                    the law; no amount of review removes all risk from either, and the
                                    underlying network, wallets, and oracles are outside our control.
                                </li>
                                <li>
                                    <strong>Publicity</strong> — blockchain transactions are permanently public.
                                    Anyone who links your wallet address to you can see your entries
                                    and claims.
                                </li>
                            </ul>
                            <p>
                                13.2. Nothing in this Section excludes liability we cannot lawfully
                                exclude; it allocates responsibility for the properties of a public
                                blockchain, which we do not operate and cannot alter.
                            </p>
                        </Section>

                        <Section title='14. Errors and void draws'>
                            <p>
                                14.1. If a draw cannot settle correctly because of a defect in the
                                Service, an oracle failure, or a material error in published draw
                                information, and the smart contract&rsquo;s own rules provide for a refund
                                path, entries are returned per those rules. Where the contract has
                                settled, the settlement stands — see 5.4.
                            </p>
                            <p>
                                14.2. Obvious errors in Service-side displays (a mispublished prize
                                amount or odds figure that contradicts the on-chain parameters) do not
                                create entitlements; the on-chain parameters govern (5.1).
                            </p>
                            <p>
                                14.3. If value is credited to you in error outside the contract&rsquo;s
                                rules, you must notify us and it is repayable as a debt.
                            </p>
                        </Section>

                        <Section title='15. Intellectual property'>
                            <p>
                                15.1. The Blockpot name, logo, and branding, and all content on the
                                Service — text, design, graphics, software, and media — belong to us or
                                our licensors. Unipot Protocol and its marks belong to its respective
                                owners.
                            </p>
                            <p>
                                15.2. We grant you a personal, non-exclusive, non-transferable,
                                revocable right to use the Service for your own participation in
                                draws. You may not copy, scrape, republish, reverse engineer, or
                                commercially exploit the Service or its content, except as the law
                                permits regardless of contract, and except that the open-source or
                                source-available portions of the protocol contracts are governed by
                                their own licences.
                            </p>
                            <p>
                                15.3. You may link to the Service&rsquo;s public pages. You must not present
                                the Service as your own or imply endorsement.
                            </p>
                        </Section>

                        <Section title='16. Liability'>
                            <p>
                                16.1. The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the
                                fullest extent the law allows, we make no warranties, express or
                                implied, about the Service&rsquo;s availability, accuracy, or fitness for
                                purpose.
                            </p>
                            <p>
                                16.2. Nothing in these Terms excludes or limits liability for fraud,
                                for death or personal injury caused by negligence, or for anything else
                                that cannot lawfully be excluded or limited.
                            </p>
                            <p>
                                16.3. Subject to 16.2, we are not liable for: indirect or consequential
                                loss; loss of profit or anticipated winnings; the acts and omissions of
                                blockchain networks, wallet providers, oracles, or other third parties;
                                your breach of Section 4.3 (wallet security); or events outside our
                                reasonable control (including network forks and outages, protocol-level
                                failures, war, natural disaster, and acts of authorities).
                            </p>
                            <p>
                                16.4. Subject to 16.2, our total aggregate liability to you arising out
                                of or in connection with these Terms is limited to the greater of (a)
                                the total Blockpot operator fees under Section 5.5(b) that you paid in
                                the 12 months before the event giving rise to the claim, and (b)
                                EUR 500.
                            </p>
                            <p>
                                16.5. You will compensate us for losses, costs, and claims we
                                reasonably incur arising from your fraud, your breach of these Terms,
                                or your unlawful use of the Service.
                            </p>
                        </Section>

                        <Section title='17. Complaints and disputes'>
                            <p>
                                17.1. If something is wrong, contact support first at
                                support@blockpot.com. Complaints about a specific draw outcome must be
                                raised within 7 days of the draw; other complaints within 1 month of
                                the events complained of. We aim to respond substantively within 8
                                weeks, and will tell you if we need longer and why.
                            </p>
                            <p>
                                17.2. In any dispute about the outcome of a draw, the on-chain record —
                                the entries, the VRF proof, and the settlement transactions — has
                                absolute evidential priority (5.4).
                            </p>
                            <p>17.3. Complaint communications are in English and may be recorded.</p>
                            <p>
                                17.4. <strong>Governing law and forum.</strong> These Terms are governed by the
                                law of Costa Rica. Disputes not resolved through our complaints process
                                are subject to the exclusive jurisdiction of the courts of San José,
                                Costa Rica — except where the law of your habitual residence gives you
                                a mandatory right to bring or defend proceedings there, which these
                                Terms do not take away.
                            </p>
                        </Section>

                        <Section title='18. General'>
                            <p>
                                18.1. <strong>Entire agreement.</strong> These Terms, with the documents they
                                incorporate (1.3), are the entire agreement between you and us about
                                the Service. Except in cases of fraud, they supersede everything
                                earlier.
                            </p>
                            <p>
                                18.2. <strong>Severability.</strong> If any provision is found invalid, the rest
                                stand.
                            </p>
                            <p>
                                18.3. <strong>No waiver.</strong> Our not enforcing a provision is not a waiver
                                of it.
                            </p>
                            <p>
                                18.4. <strong>Assignment.</strong> We may assign these Terms to a successor
                                operator of the Service, and will notify you if we do. You may not
                                assign your account or rights under these Terms.
                            </p>
                            <p>
                                18.5. <strong>No partnership.</strong> Nothing here creates any partnership,
                                agency, or joint venture between you and us.
                            </p>
                            <p>
                                18.6. <strong>Notices.</strong> We give you notice by publishing in the Service
                                and on this Terms page; where a notice concerns your account
                                specifically, we show it to you in the Service when you next use it.
                                You give us notice by emailing support@blockpot.com.
                            </p>
                            <p>
                                18.7. <strong>Survival.</strong> Sections that by their nature should survive
                                termination — including 6 (claims on escrowed prizes), 9, 11, 13, 16,
                                and 17 — survive.
                            </p>
                        </Section>

                        <Section title='Schedule A — Excluded Territories'>
                            <p>
                                Persons located or resident in the following territories may not
                                register for or use the Service. Territories outside this Schedule may
                                still be ineligible under Section 3.3. This Schedule may be amended
                                under Section 3.5; the current version is always the one published
                                here.
                            </p>
                            <p>
                                Afghanistan · Armenia · Australia · Austria · Bahrain · Bangladesh ·
                                Belarus · Belgium · Brazil · Brunei · Cambodia · Chile · China
                                (mainland) · Colombia · Costa Rica · Cuba · Czechia · Denmark ·
                                Ecuador · Egypt · Estonia · France · Georgia · Germany · Greece ·
                                Hungary · India · Indonesia · Iran · Ireland · Italy · Japan · Kenya ·
                                Kuwait · Latvia · Lithuania · Malaysia · Mexico · Morocco · Myanmar ·
                                Netherlands · North Korea · Oman · Pakistan · Panama · Peru ·
                                Philippines · Poland · Portugal · Qatar · Romania · Russia · Saudi
                                Arabia · Singapore · Slovakia · South Africa · South Korea · Spain ·
                                Sweden · Switzerland · Syria · Tanzania · Thailand · Turkey · Ukraine
                                (occupied territories) · United Arab Emirates · United Kingdom ·
                                United States of America (including its territories) · Vietnam
                            </p>
                            <p>
                                In addition, nationals of South Korea are excluded regardless of
                                location or residence (Section 3.1).
                            </p>
                        </Section>
                    </VStack>
                </Container>
            </div>
        </div>
    )
}
