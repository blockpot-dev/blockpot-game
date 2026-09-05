import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'

export const Route = createFileRoute('/cookies')({
    component: CookiePolicyPage,
})

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <VStack className='gap-3'>
            <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
            <div className='text-sm text-secondary-foreground space-y-3'>{children}</div>
        </VStack>
    )
}

function StorageRow({ what, why, howLong }: { what: string, why: string, howLong: string }) {
    return (
        <li>
            <strong>{what}</strong> — {why} <em>Kept: {howLong}.</em>
        </li>
    )
}

function CookiePolicyPage() {
    return (
        <div className='@container w-full'>
            <div className='@min-xs:max-w-[820px] mx-auto my-8 px-4'>
                <Container highlight highlightBottomBorderHidden>
                    <VStack className='gap-8'>
                        <h1 className='heading-4xl text-foreground'>Cookie Policy</h1>
                        <p className='text-sm text-secondary-foreground'>
                            Effective 5 September 2026 · Version 1.1
                        </p>

                        <Section title='1. What this covers'>
                            <p>
                                This policy describes the cookies and browser storage the
                                Blockpot game application (the &ldquo;Service&rdquo;) uses — and the
                                limited information it reads from your browser. It covers the
                                Service only; our landing and marketing sites carry their own
                                notices. It is part of our Terms and Conditions, and our Privacy
                                Policy explains how any personal information involved is
                                handled.
                            </p>
                        </Section>

                        <Section title='2. We set no cookies'>
                            <p>
                                The Service sets <strong>no cookies of its own</strong>. There is no
                                advertising, no analytics, and no cross-site tracking. Your
                                sign-in session is not a cookie either: it is a short-lived
                                token held only in the page&rsquo;s memory, gone when you close or
                                reload the tab.
                            </p>
                            <p>
                                What the Service does use is your <strong>browser&rsquo;s storage</strong> —
                                small amounts of data saved in your own browser, on your device,
                                readable only by this site. The next sections list all of it,
                                with how long each item lives and why no consent is needed for
                                it.
                            </p>
                        </Section>

                        <Section title='3. Storage the Service needs to work'>
                            <p>
                                Everything in this list exists to deliver something you
                                explicitly asked for. Basis: <strong>needed for the service you
                                requested</strong>.
                            </p>
                            <ul className='list-disc pl-5 space-y-2'>
                                <StorageRow
                                    what='Wallet connection state'
                                    why='Set by the wallet-connection libraries (wagmi; WalletConnect if you connect that way) so your wallet reconnects when you return, instead of you re-approving every visit.'
                                    howLong='until you disconnect or clear site data'
                                />
                                <StorageRow
                                    what='Terms-acceptance and registration progress'
                                    why={'Remembers, per wallet, that you completed the age attestation and registration steps, so a reload doesn’t send you through them again.'}
                                    howLong='until you clear site data'
                                />
                                <StorageRow
                                    what='Your transaction history'
                                    why='The entries and claims you made from this browser, kept per network so the activity view loads instantly and survives reloads. The blockchain remains the authoritative record.'
                                    howLong='until you clear site data'
                                />
                                <StorageRow
                                    what='Cached draw data'
                                    why='A local cache of already-fetched draw information (in IndexedDB), so pages load without re-downloading everything.'
                                    howLong='refreshed continuously; a stored copy is reused for at most 24 hours'
                                />
                            </ul>
                        </Section>

                        <Section title='4. Storage that remembers your choices'>
                            <p>Basis: <strong>a preference you set yourself</strong>.</p>
                            <ul className='list-disc pl-5 space-y-2'>
                                <StorageRow
                                    what='Display currency'
                                    why='Whether you chose to see amounts in ETH, USD, or EUR.'
                                    howLong='until you clear site data'
                                />
                                <StorageRow
                                    what='Reality-check reminders'
                                    why='Your reminder preference and the running timer for your current play session. Clearing them returns reminders to the default interval — it never switches them off. (Self-exclusion and loss limits are not stored here: they live in our systems and in the on-chain compliance state, and nothing you clear in a browser weakens them.)'
                                    howLong='preference until you clear site data; timer for the current session'
                                />
                                <StorageRow
                                    what='Prompt dismissals'
                                    why={'Remembers prompts you already saw or dismissed, so they don’t repeat. One of these lives in session storage.'}
                                    howLong='until you clear site data; the session-storage one until you close the tab'
                                />
                            </ul>
                        </Section>

                        <Section title='5. Information we read from your browser'>
                            <p>
                                Almost nothing, and none of it from your device&rsquo;s stored data.
                                To decide whether we may serve you (Terms, Section 3), your
                                location is resolved — but that happens <strong>on our servers, from the
                                characteristics of your connection</strong>, the way any website sees
                                a request. The application does not read your files, your device
                                identifiers, or other sites&rsquo; data, and does not fingerprint
                                your device.
                            </p>
                            <p>
                                The one exception is the identity-verification flow (Section 6):
                                during a verification <strong>you initiate</strong>, the provider&rsquo;s
                                embedded software performs its own device checks for fraud
                                prevention.
                            </p>
                            <p>
                                What is read is used only for the eligibility and security
                                checks the Terms describe and for the risk assessment in our
                                Privacy Policy (Sections 2.2 and 2.4) — never for advertising.
                                Basis: <strong>necessary for the service you requested and for its
                                security</strong>.
                            </p>
                        </Section>

                        <Section title='6. The verification flow'>
                            <p>
                                When you start an identity verification, it runs in an embedded
                                flow from our verification provider (Sumsub). During that flow
                                the provider may set its own cookies and storage and perform its
                                own device checks — for security, fraud prevention, and keeping
                                your progress through the check. That happens only inside a
                                verification <strong>you initiate</strong>, after the consent described in
                                our Privacy Policy (Section 2.3), and is governed by the
                                provider&rsquo;s own privacy notice alongside ours.
                            </p>
                        </Section>

                        <Section title='7. Managing storage'>
                            <p>
                                All of this lives in your browser, under your control. You can
                                clear it any time through your browser&rsquo;s settings (usually
                                under &ldquo;cookies and site data&rdquo; — browsers group site storage
                                there even when, as here, there are no cookies).
                            </p>
                            <p>
                                Clearing it does not affect your account, your prizes, or any
                                protection we apply: your funds and prizes are in your wallet
                                and on-chain, your compliance, self-exclusion, and limit
                                settings are in our systems, and the blockchain record is
                                untouched. What you will notice: your wallet asks to connect
                                again, your transaction view rebuilds from the chain, and
                                device-local preferences (display currency, reality-check
                                reminders) reset to their defaults.
                            </p>
                        </Section>

                        <Section title='8. No consent banner — and why'>
                            <p>
                                The law requires consent for storing information on your device,
                                or reading information from it, <strong>unless</strong> the storage or
                                read is strictly necessary for a service you explicitly
                                requested, or holds a preference you chose. Every item in
                                Sections 3 to 5 states which of those exemptions it relies on —
                                that is the whole inventory, and it is why the Service shows no
                                consent banner: there is nothing here consent could be asked
                                for.
                            </p>
                            <p>
                                Nothing in this policy profiles you for advertising, and nothing
                                follows you to other sites. The eligibility and security checks
                                in Section 5 are the only use we make of information read from
                                your browser. Browser privacy signals such as Global Privacy
                                Control are honoured — trivially, because there is no tracking
                                or sale of data for them to switch off.
                            </p>
                            <p>
                                If we ever introduce storage or reads that require consent, we
                                will ask for it before setting anything — and this policy will
                                change first.
                            </p>
                        </Section>

                        <Section title='9. Changes and contact'>
                            <p>
                                The current version and its effective date are always published
                                on this page. Material changes follow the Terms&rsquo; notice
                                mechanism (Terms, Section 2.1). Questions: support@blockpot.com,
                                subject &ldquo;Privacy&rdquo;.
                            </p>
                        </Section>
                    </VStack>
                </Container>
            </div>
        </div>
    )
}
