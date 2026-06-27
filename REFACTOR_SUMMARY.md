# Blockpot Frontend v1.0.0 → v2.0.0 Refactor Summary

**Branch:** `feat/v2-lgo-frontend`
**Baseline:** `dev`
**Target:** Blockpot's own Licensed Gaming Operator (LGO) frontend, aligned to the v2 neutral-infrastructure protocol in `../unipot-contracts` (branch `feat/v2-neutral-infrastructure`).
**Companion spec:** `V2_REFACTOR_INSTRUCTIONS.md` (committed alongside this refactor).

---

## Headline

Net deletion of code. v2 strips BPT, staking, governance, referrals, contributor rewards, and the start-draw bounty; adds `ComplianceRegistry` gating and a two-transaction entry flow that collects the Operator Fee outside the protocol.

| | v1 | v2 | Δ |
|---|---|---|---|
| Files changed vs `dev` | — | — | 207 (135 deleted, 11 added, 61 modified) |
| Lines of code (diff) | — | — | **−13,411** (`+2,593 / −16,004`) |
| Routes | 7 | 4 | −3 (`/earn`, `/referrals`, `/governance*`) |
| ABIs in `src/abi/` | 8 | 4 | −5 +1 |
| Feature-component folders in `src/components/blockpot/` | ~18 | ~15 | −3 (earn, referrals, governance) |
| Contract hook trees | 9 | 5 | −4 + 1 new (`compliance-registry/`) |
| TypeScript errors on baseline | 28 | 0 | Green |
| ESLint status | Config broken (ESLint 9 vs legacy `.eslintrc.json`) | Flat config, 0 warnings | Green |
| Vite build | OK | OK + router tree auto-regenerates | — |

---

## Routes deleted

- `src/routes/earn.tsx`
- `src/routes/referrals.tsx`
- `src/routes/governance/index.tsx`, `src/routes/governance/proposal.tsx` (+ folder)

Surviving routes: `/`, `/play`, `/transparency`, `/how-to-play`.

---

## Feature folders deleted

- `src/components/blockpot/earn/` — BPT staking, rewards claim, start-draw bounty, LINK exchange
- `src/components/blockpot/referrals/` — referral codes, affiliate stats
- `src/components/blockpot/governance/` — proposals, parameter configurators, voting
- `src/components/blockpot/modals/BPTDialog/`
- `src/components/blockpot/entries/EntryOptions/ApplyReferralCode/`
- `src/components/blockpot/transparency/ContributorPayouts.tsx`, `ContributorClaimDialog.tsx`
- `src/components/blockpot/header/BPTWalletItem.tsx`
- `src/components/blockpot/common/Token.tsx`, `TokenLabel.tsx` (BPT-only)

---

## Hook trees deleted

- `src/hooks/contracts/block-pot-token/`
- `src/hooks/contracts/block-pot-reward-tracker/`
- `src/hooks/contracts/block-pot-referral-manager/`
- `src/hooks/contracts/block-pot-config-manager/`
- `src/hooks/contracts/write/` (contributor rewards)
- `src/hooks/governance/`
- Individual files: `useApplyReferralCode`, `useLotteryDiscounts`, `useStartDraw`, `useContributorInfo`, `useContributorClaim`, `useContributorPayouts`, plus the 5 corresponding `use*Read.ts` factories

## Hook tree added

- `src/hooks/contracts/compliance-registry/`
  - `useComplianceRegistryRead.ts` — generic factory
  - `useIsOperatorWhitelisted.ts` — queries `isWhitelisted(OPERATOR_ADDRESS)`

---

## ABIs

**Deleted** (`src/abi/`):
- `blockPotTokenAbi.ts`
- `blockPotRewardTrackerAbi.ts`
- `blockPotReferralManagerAbi.ts`
- `blockPotConfigManagerAbi.ts`
- `contributorsRewardTrackerAbi.ts`

**Added:**
- `complianceRegistryAbi.ts`

**Refreshed** (v2 shapes):
- `lotteryAbi.ts` — new `enter(roundIndex, amount, payoutInWeth, operator)` signature; `getRoundData` returns `status` (enum) instead of `done: bool`; `getNextDrawTime`, `peaPerEntry`, `contributorFeeBps` added; `drawNumbersOperationsRewards` removed
- `fundsManagerAbi.ts` — `balances()` now returns `{ nextPot, pot, parentGame }` only
- `wethAbi.ts`

`cli/abis.toml` in the contracts repo was also updated (drop 5 deleted contracts, add `complianceRegistry`) — **that change lives in the contracts repo**, not this one.

---

## Heavily refactored files

| File | Change |
|---|---|
| `src/constants/contract-addresses.ts` | `ContractName` enum narrowed: `LOTTERY_MAIN`, `CHAINLINK_AGGREGATOR_V3`, `FUNDS_MANAGER_MAIN`, `COMPLIANCE_REGISTRY` (new), `QUICK_GAME`, `WETH`. All 4 per-chain maps pruned. |
| `src/constants/protocol.ts` | New: `PEA_PER_ENTRY_WEI`, `CF_BASIS_POINTS`, `DEFAULT_OF_BASIS_POINTS`, `BASIS_POINTS_DIVISOR`. |
| `src/constants/operator.ts` | New: validated reads of `VITE_OPERATOR_ADDRESS` / `VITE_OPERATOR_FEE_BPS`; exports `OPERATOR_ADDRESS`, `OPERATOR_FEE_BPS`, `OPERATOR_CONFIG_VALID`. |
| `src/hooks/contracts/lottery/actions/useEnterLottery.ts` | Two-transaction flow: step 1 `sendTransaction(OPERATOR_ADDRESS, of)`, step 2 `enter([roundIndex, amount, payoutInWeth, operator], { value: pea + cf })`. Gated on `useIsOperatorWhitelisted`. Exports `computeEntryCostBreakdown()`. |
| `src/hooks/entry/useEntryForm.ts` | Dropped BPT/discount/referral wiring. Exposes `pea`, `cf`, `of`, `total` (all `Amounts`), `amountPerEntry`, basis-point constants, `isOperatorWhitelisted`, `error`. |
| `src/hooks/contracts/lottery/useLotteryState.ts` | Dropped `drawNumbersOperationsRewards`. Adapted to v2 `currentGameConfig` / `getRoundData` shapes. |
| `src/hooks/contracts/transparency/useBalanceAllocations.ts` | Rewritten for v2 `balances()` shape (`pot`, `nextPot`, `parentGame`, `contractBalance`). |
| `src/types/lottery/config.ts` (`GameConfig`) | Rewritten for v2: `prizeTierAllocations`, `nextPotAllocation`, `parentGamePotAllocation`, `chanceInitial/Multiplier/Increment/Max`, `ignoreOdds`. All `number` (uint24/48 fit in JS number). |
| `src/providers/Web3Provider.tsx` | Short-circuits to a `OperatorConfigError` page if `OPERATOR_CONFIG_VALID` is false. |
| `src/providers/LotteryProvider.tsx` | Narrowed to round pagination only; dropped BPT/tracker/config/proposal aggregation. |
| `src/providers/BlockpotEventsProvider.tsx` | Dropped subscriptions to deleted contracts. Event filter uses v2 `beneficiary` arg. |
| `src/providers/ModalOpenStateProvider.tsx` | Dropped `bptDialogOpen` binding. |
| `src/routes/__root.tsx` | Removed `PinataStorageProvider`. Mounted `<OperatorStatusBanner/>` directly below `<Header/>`. |
| `src/components/blockpot/entries/{EntryOptions,EntrySummary,index}.tsx` | Rebuilt for v2: EntryOptions is a plain entry-amount picker; EntrySummary shows PEA / CF / OF / Total with per-row native + fiat. |
| `src/components/blockpot/play/index.tsx` | New form props; `<ResponsibleGamingPlaceholder/>` mounted at page bottom. |
| `src/components/blockpot/transparency/index.tsx`, `BlockpotBalances.tsx` | ContributorPayouts removed; BlockpotBalances uses v2 balance shape. |
| `src/components/blockpot/header/Header.tsx` | Removed BPT, earn/referrals/governance nav, fixed stale `next/image` import. |
| `src/routes/how-to-play.tsx` | Rewritten from placeholder into real four-section explainer (ticket cost, draws, payouts, wallet). |
| `index.html` | Title + description + OG tags reframe as licensed on-chain lottery. |
| `vite.config.ts` | Registered `@tanstack/router-plugin/vite` so `routeTree.gen.ts` regenerates on dev/build. |

---

## New components

- `src/components/blockpot/common/OperatorStatusBanner.tsx` — blocking banner above `<Outlet/>` when the configured operator is not whitelisted.
- `src/components/blockpot/common/ResponsibleGamingPlaceholder.tsx` — dashed-destructive-border stub at the bottom of `/play` pointing at `TODO.md`.

---

## Environment changes

**Added** (`.env.example`):
- `VITE_OPERATOR_ADDRESS` — LGO operator wallet, validated at startup
- `VITE_OPERATOR_FEE_BPS` — default 500 (5%), clamped ≤ 2000
- `VITE_MOCK_COUNTRY` — now documented

**Removed**:
- `VITE_PINATA_API_KEY`
- `VITE_PINATA_API_SECRET`

---

## Tooling-level changes

- **ESLint migrated to flat config** (`eslint.config.mjs`). Legacy `.eslintrc.json` removed. React Hooks v7 strict rules (`set-state-in-effect`, `purity`, `refs`, `static-components`) disabled to match pre-migration behavior. Phase 1 deletion paths ignored so pre-delete warnings don't block the gate.
- **Lint script updated** — dropped the ESLint-9-incompatible `--ext` flag.
- **TanStack Router Vite plugin registered** — auto-regenerates `routeTree.gen.ts`. Previously missing, causing `vite build` to break when routes were deleted.
- **Dropped three stale `next/*` imports** across the codebase (`next/image` in Header + ConnectWalletItem, `next/link` in Footer). All pre-dated the Vite migration; the first two were latent runtime errors, the last blocks footer render.

---

## Entry-flow change (user-visible)

The frontend collects `LEF = PEA + CF + OF` as **two on-chain transactions**:

| | | |
|---|---|---|
| **PEA** | Protocol Entry Amount | 0.001 ETH per entry, hardcoded. Flows to prize pool. |
| **CF** | Contributor Fee | 2% of PEA. Routed by Lottery to DevCo on-chain. |
| **OF** | Operator Fee | 5% of PEA by default. Invisible to protocol — frontend transfers to operator wallet. |

1. `sendTransactionAsync({ to: OPERATOR_ADDRESS, value: of })` — pay OF
2. On success, `enter([roundIndex, amount, payoutInWeth, operator], { value: pea + cf })` — submit entry

Both gated on `isWhitelisted(OPERATOR_ADDRESS)` against `ComplianceRegistry`. If the operator is not whitelisted, entry is refused before any gas is spent and `OperatorStatusBanner` surfaces a site-wide message.

---

## Known limitations carried forward

- **Two-wallet-prompt entry flow.** Step-1 success + step-2 failure leaves the user paying OF with no tickets (refund-required state surfaced in UI). The Option B router contract (`BlockpotLGORouter`) is the planned follow-up for single-tx entry.
- **All per-chain `complianceRegistry` addresses are `ZERO_ADDRESS` placeholders.** Must be populated from v2 deployment before launch.
- **KYC/AML, self-exclusion, age gate, session limits, problem-gambling resources** — explicitly out of scope; stubbed by `ResponsibleGamingPlaceholder`. Tracked in `TODO.md`.
- **Storybook** — 3 entries/* stories deleted (v1 prop shapes unreconstructable without rebuilding); surviving stories build clean.
- **Quick Game** — contract addresses populated; no UI wiring.

---

## Commit history (branch-only)

```
0dea8b5  Fix typecheck baseline and migrate ESLint to flat config  (pre-work on dev)
b093cf7  Drive baseline lint to zero warnings                      (pre-work on dev)
084f537  Add v2 refactor seed docs
f7fc6cc  [Phase 1] Delete v2-removed surface, sync v2 ABIs
1e7088d  [Phase 2] Constants, env, contract wiring for v2
81a7267  [Phase 3] Hook-layer refactor for v2
5c424c8  [Phase 4] Component-layer refactor; all gates green
89ef1ad  [Phase 5] Copy pass
9e5b920  [Phase 6] Docs update for v2
```

---

## Gate status (final)

- `bun typecheck` — clean
- `bun lint` — 0 warnings (`--max-warnings 0` satisfied)
- `bun run build` — clean (builds in ~6s)
- `bun storybook:build` — clean
- `bun dev` — `/`, `/play`, `/transparency`, `/how-to-play` all return 200
