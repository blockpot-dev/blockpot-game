# Outstanding LGO Compliance Features

This file tracks compliance and product features that are required for the
Blockpot LGO frontend to go to production, and which are explicitly out of
scope for the v2 protocol-alignment refactor.

## Required before launch

- [ ] KYC integration (Sumsub or equivalent). Identity verification before
      first entry. Persistent KYC state per wallet address.
- [ ] AML wallet screening (Chainalysis or equivalent) at connection time.
      Block entries from flagged addresses.
- [ ] Age verification gate (18+).
- [ ] Self-exclusion flow. User can permanently block their own wallet from
      entering. Persistent across sessions.
- [ ] Deposit / entry limits. User-configurable caps on per-session and
      per-day entry spend.
- [ ] Session time limits. Warning + forced break after configurable duration.
- [ ] Problem gambling resources page. Helpline numbers by jurisdiction.
- [ ] Updated Terms of Service and Privacy Policy, reviewed by counsel.
- [ ] Cookie / tracking consent banner (GDPR, etc.).
- [ ] Geofencing beyond the current CountryProvider — per-jurisdiction
      allow/deny lists enforced server-side, not just client-side.

## Infrastructure

- [ ] Keeper service that calls drawNumbers / finalizeRound on schedule.
      Out-of-repo. Owned by the LGO Costa Rica entity's ops team.
- [ ] Monitoring and alerting for operator wallet balance (OF receipts,
      gas for keeper).
- [ ] Backend for customer support, refund handling (including the known
      OF-paid-but-entry-failed edge case).

## Known limitations to revisit

- [ ] Two-transaction entry flow (OF transfer + Lottery.enter). Consider
      migrating to a single-tx LGO router contract to cut user friction.
- [ ] `ComplianceRegistry` addresses on `arbitrum-testnet` and
      `polygon-testnet` are still zero-address placeholders. Populate
      once v2 is deployed to those networks (blockpot-testnet and local
      are populated).
