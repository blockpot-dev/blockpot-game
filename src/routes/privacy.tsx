import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'

export const Route = createFileRoute('/privacy')({
    component: PrivacyPolicyPage,
})

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <VStack className='gap-3'>
            <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
            <div className='text-sm text-secondary-foreground space-y-3'>{children}</div>
        </VStack>
    )
}

function PrivacyPolicyPage() {
    return (
        <div className='@container w-full'>
            <div className='@min-xs:max-w-[820px] mx-auto my-8 px-4'>
                <Container highlight highlightBottomBorderHidden>
                    <VStack className='gap-8'>
                        <h1 className='heading-4xl text-foreground'>Privacy Policy</h1>
                        <p className='text-sm text-secondary-foreground'>
                            Effective 5 September 2026 · Version 1.1
                        </p>

                        <Section title='1. Who we are'>
                            <p>
                                1.1. This policy explains what personal information Blockpot
                                collects when you use the Blockpot game application (the
                                &ldquo;Service&rdquo;), how we use it, who we share it with, and the
                                choices you have. It covers the Service only; our landing and
                                marketing sites carry their own privacy notices.
                            </p>
                            <p>
                                1.2. The controller of your personal information is{' '}
                                <strong>3-102-967838 S.R.L.</strong>, a limited liability company
                                incorporated in Costa Rica whose legal name is its corporate
                                identification number, cédula jurídica 3-102-967838, with its
                                registered address at Avenida Escazú, Torre 102, Oficina 203-C,
                                San José, San José 10203, Costa Rica, trading as{' '}
                                <strong>Blockpot</strong>.
                            </p>
                            <p>
                                1.3. For anything in this policy, contact support@blockpot.com
                                with the subject &ldquo;Privacy&rdquo;.
                            </p>
                            <p>
                                1.4. This policy is part of our Terms and Conditions. Terms
                                defined there mean the same here. Our Cookie Policy covers the
                                cookies and browser storage the Service uses.
                            </p>
                        </Section>

                        <Section title='2. What we collect'>
                            <p>
                                2.1. <strong>When you register.</strong> We keep registration deliberately
                                small. We collect: your wallet address, and the signed message
                                proving you control it; your date of birth, as you declare it;
                                and your acceptance of the Terms, together with the version you
                                accepted, the time, your IP address at that moment, and the
                                country we resolved from it.
                            </p>
                            <p>
                                2.2. <strong>Resolved automatically.</strong> To decide whether we may serve
                                you, we derive your location from technical signals — your IP
                                address, network and device signals, and the origin of the funds
                                you play with — and record the resolved country and a snapshot of
                                the signals we consulted. There is no country field for you to
                                fill in; we resolve it ourselves. And we screen your wallet address against
                                sanctions data before your account is created and daily
                                thereafter (Section 5).
                            </p>
                            <p>
                                If registration is refused — because of your location, your age,
                                or a sanctions match — we keep nothing beyond standard access
                                logs, with one exception: a sanctions match records the wallet
                                address and the screening result, as the law requires.
                            </p>
                            <p>
                                2.3. <strong>When verification is required.</strong> The Service asks you to
                                verify your identity only when something you are doing requires
                                it (Terms, Section 8). Depending on the check, our
                                identity-verification provider collects on our behalf:
                                government-issued photo ID and a live selfie; proof of address;
                                your declared and, where required, documented source of funds or
                                wealth, and the outcome of our review of it; and your tax
                                residency, where the check requires it.
                            </p>
                            <p>
                                The selfie is used to confirm that the person presenting the ID
                                is the person in it. <strong>This is biometric processing.</strong> We ask
                                for your explicit consent before it runs, and you can withdraw
                                that consent — in which case we cannot complete verification, and
                                the action that required it remains unavailable. The biometric
                                material is retained by our verification provider for the same
                                period as your other verification records (Section 7.1), and no
                                longer.
                            </p>
                            <p>
                                The raw documents stay with the provider (Section 5). We store
                                only references: the document type, the provider&rsquo;s identifier,
                                timestamps, the outcome, and any rejection reason — not the
                                documents themselves.
                            </p>
                            <p>
                                2.4. <strong>As part of compliance.</strong> The law requires us to assess
                                and monitor accounts, so we hold: screening results and statuses
                                for your identity and your wallets — sanctions,
                                politically-exposed-person (PEP), and adverse-media results,
                                obtained from our verification provider&rsquo;s screening databases
                                and from the sanctions sources in Section 5; a resulting risk
                                assessment of your account; where available on funds arriving
                                from an exchange, information identifying the sending
                                institution; and, where an account is investigated, case records
                                kept by our compliance staff. Access to all of this is restricted
                                to compliance roles (Section 9).
                            </p>
                            <p>
                                2.5. <strong>Your responsible-play settings.</strong> The limits you set,
                                cooling-off and self-exclusion status, reality-check preferences,
                                and anything you tell us about problem play (Terms, Section 10).
                            </p>
                            <p>
                                2.6. <strong>As you play.</strong> We keep a ledger of your activity —
                                entries, prizes, claims — including the EUR value of each
                                transaction at the exchange rate recorded at the time. This
                                ledger is what the limits, thresholds, and return rules in the
                                Terms are computed from. It references your on-chain
                                transactions, which are public (Section 4).
                            </p>
                            <p>
                                2.7. <strong>When you contact us.</strong> Support correspondence,
                                complaints, and anything you send with them. Complaint
                                communications may be recorded (Terms, Section 17.3).
                            </p>
                            <p>
                                2.8. <strong>What we do not collect.</strong> We do not collect your name,
                                email address, or phone number at registration — there is nothing
                                to type but a date of birth. We run no analytics or tracking
                                tools in the Service, we do not buy marketing data about you from
                                anyone, and the only information we obtain about you from third
                                parties is the compliance screening described in 2.4. If any of
                                this changes, this policy will change first.
                            </p>
                        </Section>

                        <Section title='3. Why we use it, and on what legal grounds'>
                            <p>
                                3.1. The grounds we rely on, per purpose. Where the law of your
                                jurisdiction imposes the compliance duties directly on us, we
                                also rely on legal obligation for those purposes. Where Costa
                                Rican law applies to us as controller, processing rests on the
                                express consent you give at registration together with that
                                law&rsquo;s statutory exceptions, since it does not use the same
                                taxonomy of grounds.
                            </p>
                            <ul className='list-disc pl-5 space-y-1'>
                                <li>
                                    <strong>Creating and operating your account, running entries and
                                    claims</strong> — to provide the Service. Ground: performance of our
                                    contract with you.
                                </li>
                                <li>
                                    <strong>Resolving your location, screening wallets and identities,
                                    assessing risk, keeping the EUR ledger, retaining compliance
                                    records</strong> — operating a lawful service: knowing who we serve,
                                    preventing money laundering and sanctions evasion, keeping
                                    the records that prove it. Grounds: legitimate interests and
                                    performance of our contract; legal obligation where the law
                                    of a served jurisdiction imposes the duty on us.
                                </li>
                                <li>
                                    <strong>The biometric check at verification</strong> (selfie matched to
                                    ID) — confirming you are the person in the document. Ground:
                                    your explicit consent.
                                </li>
                                <li>
                                    <strong>Applying responsible-play controls</strong> (limits,
                                    self-exclusion, reality checks) — player protection. Grounds:
                                    legitimate interests; your request; legal obligation where
                                    imposed.
                                </li>
                                <li>
                                    <strong>Answering support requests and complaints</strong> — to help you.
                                    Grounds: performance of our contract; legitimate interests.
                                </li>
                                <li>
                                    <strong>Establishing, exercising, or defending legal claims</strong> —
                                    protection of our rights. Ground: legitimate interests.
                                </li>
                            </ul>
                            <p>
                                3.2. <strong>Automated decisions.</strong> Some decisions with real effects
                                on you are made automatically: the location gate at registration
                                and at each transaction, the age check, and the sanctions screen
                                on your wallets. We rely on these being necessary for entering and
                                performing our contract with you and, where applicable,
                                authorised by the law that applies to us. You can contest any of
                                them: write to support@blockpot.com and a human — our compliance
                                officer — will review the decision and tell you the outcome.
                            </p>
                            <p>
                                3.3. We do not use your personal information for marketing unless
                                you separately opt in to receive it, and we never send marketing
                                to self-excluded players. We do not sell your personal
                                information.
                            </p>
                        </Section>

                        <Section title='4. The blockchain is public'>
                            <p>
                                4.1. Your entries and claims are transactions on a public
                                blockchain. They are recorded permanently, replicated worldwide,
                                and visible to anyone — tied to your wallet address, not your
                                name. Anyone who links your wallet address to you can see your
                                on-chain activity. We cannot edit, hide, or delete blockchain
                                records, and no privacy right anywhere obliges or enables us to.
                            </p>
                            <p>
                                4.2. What we hold off-chain (your registration, verification
                                references, compliance records, and ledger) is private and
                                governed by this policy. What is on-chain is outside any
                                operator&rsquo;s control — ours included.
                            </p>
                        </Section>

                        <Section title='5. Who we share it with'>
                            <p>5.1. <strong>Service providers acting for us:</strong></p>
                            <ul className='list-disc pl-5 space-y-1'>
                                <li>
                                    <strong>Sumsub</strong> (Sum and Substance Ltd) — identity verification,
                                    including the biometric check, and ongoing identity-side
                                    screening: sanctions lists (OFAC, UK OFSI, EU, UN, HMT), PEP
                                    categories, and adverse media, refreshed daily. They receive
                                    your ID documents, selfie, proof of address, and
                                    source-of-funds information, collected directly from you in
                                    their embedded flow, and retain the raw documents under
                                    contract with us.
                                </li>
                                <li>
                                    <strong>Chainalysis</strong> — wallet sanctions screening. Usually they
                                    receive nothing: the primary check reads Chainalysis&rsquo;s
                                    on-chain sanctions oracle, which sends them no data. If that
                                    read fails, the backup check sends your wallet address —
                                    already-public data — to their sanctions API. A public
                                    sanctions-list mirror is also cross-checked without sending
                                    anything. This screening covers direct sanctions-list
                                    matches; it is not comprehensive on-chain risk profiling.
                                </li>
                                <li>
                                    <strong>Cloud infrastructure providers</strong> — hosting the Service and
                                    its backend; they process the data of the systems they host,
                                    under data-processing terms.
                                </li>
                                <li>
                                    <strong>Blockchain access and wallet-connection providers</strong> (RPC
                                    endpoints, the WalletConnect relay) — carrying your
                                    transactions and wallet sessions; they see your IP address
                                    and wallet address as a technical consequence of connecting.
                                </li>
                                <li>
                                    <strong>Our support mailbox provider</strong> — delivering support email;
                                    they handle whatever you send to support@blockpot.com.
                                </li>
                            </ul>
                            <p>
                                Chainlink price feeds supply the exchange rates used for the EUR
                                ledger. They receive nothing about you — the data flows one way,
                                from the oracle to us.
                            </p>
                            <p>
                                5.2. <strong>The protocol&rsquo;s steward and compliance gatekeeper.</strong>{' '}
                                Blockpot operates under agreements with the entities that steward
                                Unipot Protocol and approve its operators. Where those agreements
                                require it, we may share compliance-relevant information about
                                specific accounts with them — never for marketing.
                            </p>
                            <p>
                                5.3. <strong>Authorities.</strong> We disclose personal information to
                                regulators, financial-intelligence units, law enforcement, and
                                courts where the law requires it — including suspicious-activity
                                reporting, which we may be prohibited from telling you about.
                            </p>
                            <p>
                                5.4. <strong>Corporate events.</strong> If the Service is transferred to a
                                successor operator (Terms, Section 18.4), the successor becomes
                                the controller of your information under this policy, and we will
                                tell you before the transfer takes effect.
                            </p>
                            <p>
                                5.5. <strong>Nobody else.</strong> We do not share your personal information
                                with advertisers, data brokers, or social networks.
                            </p>
                        </Section>

                        <Section title='6. International transfers'>
                            <p>
                                Your information is processed where we and our providers operate,
                                which may be outside the country you live in. Where a transfer
                                needs safeguards under the law that applies to you, we rely on
                                contractual protections with the receiving party. You can ask us
                                at support@blockpot.com which safeguards apply to a specific
                                transfer.
                            </p>
                        </Section>

                        <Section title='7. How long we keep it'>
                            <p>
                                7.1. <strong>Compliance records are kept for at least seven years from
                                the end of our relationship with you</strong> — or, for records tied to
                                a single transaction rather than the account, seven years from
                                the transaction. That covers: identity, address, and
                                source-of-funds documentation (as references — the raw documents
                                sit with our verification provider under the same clock),
                                screening results including a recorded sanctions match, the EUR
                                ledger, on-chain transaction references, related communications,
                                and compliance case files. Seven years exceeds the five-year
                                minimum of the strictest regimes relevant to us and applies
                                whether your account is open or closed. Each record carries an
                                expiry date, and expiry triggers review and deletion rather than
                                silent retention.
                            </p>
                            <p>
                                7.2. <strong>Self-exclusion records</strong> are different: a permanent
                                self-exclusion is kept for as long as needed to keep it
                                effective — indefinitely — and a timed one for its period plus a
                                safety margin. They exist to stop the excluded person coming
                                back, so they cannot be deleted on request (Section 8.2).
                            </p>
                            <p>7.3. <strong>Access logs</strong> are kept for 12 months and then deleted.</p>
                            <p>
                                7.4. <strong>Support correspondence</strong> unrelated to a compliance matter
                                is kept for 2 years after our last contact.
                            </p>
                            <p>
                                7.5. When a retention period ends, we delete or irreversibly
                                anonymise the record.
                            </p>
                        </Section>

                        <Section title='8. Your rights'>
                            <p>
                                8.1. Depending on where you live, you may have the right to
                                access the personal information we hold about you, correct it,
                                delete it, restrict or object to some processing — including
                                processing based on our legitimate interests — receive a copy in
                                a portable format, and withdraw any consent you have given. We
                                honour these rights for everyone, not only where a statute forces
                                us to, except where 8.2 applies.
                            </p>
                            <p>
                                8.2. <strong>What we cannot delete on request, stated honestly.</strong> Most
                                of what we hold about you, we hold because the law requires us to
                                hold it — and the same law prohibits us from deleting it on
                                request for the retention period in Section 7.1. Self-exclusion
                                records are kept for their own protective purpose (Section 7.2)
                                and are likewise not deleted on request. A deletion request
                                therefore removes what we are free to remove and leaves those
                                records intact until their clocks run out, at which point they
                                are deleted without your needing to ask again. We will always
                                tell you which category applied to your request.
                            </p>
                            <p>
                                8.3. <strong>Withdrawing consent.</strong> You can withdraw marketing consent
                                at any time and marketing stops. You can withdraw biometric
                                consent at any time; verification then cannot complete, and
                                whatever required it stays unavailable (Section 2.3). Withdrawal
                                never affects the lawfulness of what was done while consent
                                stood.
                            </p>
                            <p>
                                8.4. <strong>What we can never do</strong>, for anyone: alter or erase
                                blockchain records (Section 4), or un-report a report already
                                made to an authority.
                            </p>
                            <p>
                                8.5. <strong>Complaints.</strong> You can complain to the data-protection
                                authority where you live. In Costa Rica that is PRODHAB, the
                                Agencia de Protección de Datos de los Habitantes.
                            </p>
                            <p>
                                8.6. Exercise any of these by writing to support@blockpot.com
                                with the subject &ldquo;Privacy&rdquo;. We respond within one month; if a
                                request is complex we may take up to two more, and will tell you
                                why. Verifying that you control the wallet in question is part of
                                every request — we will not act on a request we cannot attribute.
                            </p>
                        </Section>

                        <Section title='9. How we protect it'>
                            <p>
                                9.1. Your identity documents never touch our systems: they are
                                collected by, and stay with, our verification provider, and we
                                hold only references and outcomes. The activity ledger is
                                immutable once written and every entry carries a tamper-detection
                                hash. Compliance records are accessible only to staff in defined
                                compliance roles, on a need-to-know basis, with every access and
                                change written to an audit log. The Service itself holds no
                                custodial funds to steal — your money is in your wallet and in
                                on-chain contracts, not with us.
                            </p>
                            <p>
                                9.2. <strong>If a breach happens</strong>, we will notify the competent
                                authority where the law requires it — within 72 hours where that
                                is the standard — and tell affected players without undue delay
                                where the breach puts them at high risk.
                            </p>
                        </Section>

                        <Section title='10. Age'>
                            <p>
                                The Service is for adults. We do not knowingly hold personal
                                information about anyone under 18 (or the higher minimum age of
                                their jurisdiction). An underage registration attempt is refused
                                and leaves nothing behind; if we discover an account is underage,
                                we close it under the Terms and delete what the law does not
                                require us to keep.
                            </p>
                        </Section>

                        <Section title='11. Changes to this policy'>
                            <p>
                                The current version and its effective date are always published
                                on this page. Material changes follow the same notice mechanism
                                as the Terms (Terms, Section 2.1): no earlier than 14 days after
                                publication with an in-Service notice, except changes required by
                                law, which take effect on publication.
                            </p>
                        </Section>

                        <Section title='12. Contact'>
                            <p>
                                <strong>3-102-967838 S.R.L.</strong>, trading as Blockpot
                                <br />
                                Avenida Escazú, Torre 102, Oficina 203-C, San José, San
                                José 10203, Costa Rica
                                <br />
                                support@blockpot.com — subject &ldquo;Privacy&rdquo;
                            </p>
                            <p>
                                Our <strong>Privacy Officer</strong> is responsible for the protection of
                                personal information at Blockpot and is reached at the same
                                address.
                            </p>
                        </Section>
                    </VStack>
                </Container>
            </div>
        </div>
    )
}
