# Blockpot Frontend — Refactor Instructions for Claude Code

**Target version:** v2.0.0 (BlockpotOperator frontend for neutral-infrastructure protocol)
**Author:** Stefan
**Status:** Ready for execution
**Companion document:** `BLOCKPOT_REFACTOR_INSTRUCTIONS.md` (contracts repo). Execute the contracts refactor first; this frontend refactor depends on the v2 ABIs produced there.
**Estimated scope:** Major refactor. Three routes deleted, two routes substantially simplified. Seven contract hook trees deleted. Full copy pass required. One new contract ABI and hook tree added.

-----

## 0. Read Before You Start

This document is the authoritative spec for refactoring the Blockpot frontend from v1.0.0 to v2.0.0. The v1.0.0 frontend was a community draw dApp with BPT staking, governance voting, affiliate referrals, and start-draw bounties. The v2.0.0 frontend is the user-facing web application for **Blockpot’s own Approved Operator**, connecting to neutral, immutable protocol infrastructure. Roughly 40% of the v1 feature surface maps to on-chain features that no longer exist.

Before you write any code:

1. Read `ARCHITECTURE.md` end to end.
1. Read this entire document end to end.
1. Confirm the contracts repo refactor (`BLOCKPOT_REFACTOR_INSTRUCTIONS.md`) is complete and the v2 ABIs are available. If v2 ABIs are not yet synced, stop and ask — do not proceed against v1 ABIs.
1. Run `bun install`, `bun typecheck`, `bun lint`, `bun build` against the current branch to confirm the baseline is green.
1. Create a new branch: `feat/v2-lgo-frontend`.
1. Work in the order laid out in Section 7 (Execution Order). Do not skip ahead.

If any step in this document conflicts with what you find in the code, **stop and ask**. Do not improvise or expand scope.

-----

## 1. Strategic Context (the why)

The contracts have been refactored to neutral infrastructure: no token, no governance, no referrals, no staking, no on-chain rewards, no operator-collected fees. Entries are gated by an on-chain `ApprovedOperatorRegistry` that whitelists operator addresses.

This frontend is **Blockpot’s own BlockpotOperator frontend**, run by the Costa Rica gaming operator entity in Phase 1. It is not “the protocol.” It is a licensed prize draw operator that happens to use Unipot Protocol as its backend. It competes with (in principle) future third-party operators that will run their own frontends against the same protocol.

That framing has two practical consequences:

1. **User-facing copy** should read as a lottery product, not as a community-owned protocol. Language like “stake to earn a share of protocol revenue,” “vote on proposals,” “refer your friends and earn BPT” goes away entirely.
1. **The frontend owns the Operator Fee (OF).** The protocol does not know about the OF. The frontend collects `LEF = PEA + CF + OF` from the user, keeps the OF, and forwards `PEA + CF` to the protocol via the entry call. See §5.3.

Responsible gaming, KYC/AML, and other BlockpotOperator-compliance features are explicitly **out of scope for this refactor** (see §8). A placeholder will be added so they are not forgotten.

-----

## 2. Glossary

|Term                  |Meaning                                                                                                                                             |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
|**PEA**               |Protocol Entry Amount. 0.001 ETH per entry. Goes to the prize pool.                                                                                 |
|**CF**                |Contributor Fee. 2% of PEA. Paid to DevCo via the protocol.                                                                                         |
|**OF**                |Operator Fee. 5% of PEA by default (configurable via env var — see §5.3). Kept by this frontend’s operator wallet. Invisible to the protocol.       |
|**LEF**               |Lottery Entry Fee. Total user pays: `LEF = PEA + CF + OF`.                                                                                          |
|**BlockpotOperator**               |Approved Operator. This frontend belongs to Blockpot’s own BlockpotOperator.                                                                              |
|**Operator wallet**   |The on-chain address whitelisted in `ApprovedOperatorRegistry` for this BlockpotOperator. Passed as the `operator` parameter on every entry call. Also receives the OF.|
|**ApprovedOperatorRegistry**|New v2 contract. On-chain allowlist of operator addresses.                                                                                          |

-----

## 3. Scope Summary

### 3.1 Routes to delete

Delete the route file and the corresponding feature folder:

- `src/routes/earn.tsx` and `src/components/blockpot/earn/` (BPT staking, rewards claim, start-draw, LINK exchange)
- `src/routes/referrals.tsx` and `src/components/blockpot/referrals/`
- `src/routes/governance/index.tsx`, `src/routes/governance/proposal.tsx`, the `src/routes/governance/` folder itself, and `src/components/blockpot/governance/`

After deleting, let `@tanstack/router-plugin` regenerate `routeTree.gen.ts` on the next dev/build. Do not hand-edit the generated file.

### 3.2 Routes to keep (with changes)

- `src/routes/index.tsx` — keep; still redirects to `/play`.
- `src/routes/play.tsx` — keep; major content changes (see §5).
- `src/routes/how-to-play.tsx` — keep; full copy pass required (§6).
- `src/routes/transparency.tsx` — keep; strip contributor payout/claim UI; keep contract-balance display.
- `src/routes/__root.tsx` — keep; provider stack is heavily pruned (§5.1).

### 3.3 Providers to delete

Delete the file and remove from the provider stack in `__root.tsx`:

- `src/providers/BlockpotEventsProvider.tsx` — keep this one (lottery events still matter), but audit which events are still emitted by the v2 protocol and strip subscriptions to deleted events (token mints, proposal events, staking events, referral events).
- `src/providers/LotteryProvider.tsx` — **refactor, do not delete**. It aggregates token/tracker/config/proposals state in v1. In v2 it should aggregate only round data (current round, drawn round, view round, round pagination). Rename internally or leave the name — prefer leaving it unless the rename is low-risk.
- `src/providers/PinataStorageProvider.tsx` — **delete**. IPFS uploads were only used for governance proposal content. No v2 feature needs Pinata.

Keep all other providers: `CountryProvider`, `QueryClientProvider`, `Web3Provider`, `Web3ConnectionProvider`, `TransactionsProvider`, `SelectedGameProvider`, `ModalOpenStateProvider`, `BlockpotProvider`, `MissedDrawProvider`, `BlockpotDrawProvider`.

Also delete `src/providers/SettingsProvider.tsx` — it is currently commented out in `__root.tsx` and has no active use. Confirmed dormant by the architecture doc.

### 3.4 Contract hooks to delete

Delete the entire folder:

- `src/hooks/contracts/block-pot-token/`
- `src/hooks/contracts/block-pot-reward-tracker/`
- `src/hooks/contracts/block-pot-referral-manager/`
- `src/hooks/contracts/block-pot-config-manager/`
- `src/hooks/contracts/write/` (if its only content is `useContributorsRewardTrackerWrite`; otherwise delete just that file)

Delete the following individual read-factory files in `src/hooks/contracts/read/`:

- `useBlockpotTokenRead.ts`
- `useBlockpotRewardTrackerRead.ts`
- `useConfigManagerRead.ts`
- `useReferralManagerRead.ts`
- `useContributorsRewardTrackerRead.ts`

Delete the following entry-related hooks:

- `src/hooks/entry/useApplyReferralCode.ts`
- `src/hooks/contracts/lottery/useLotteryDiscounts.ts`
- `src/hooks/contracts/lottery/actions/useStartDraw.ts`

Delete the following utility hook:

- `src/hooks/governance/useSelectedProposalContext.tsx` (and the `src/hooks/governance/` folder if empty afterward)

### 3.5 Contract hooks to add

New folder: `src/hooks/contracts/compliance-registry/`

- `useApprovedOperatorRegistryRead.ts` - generic read factory (mirrors pattern of other `use*Read.ts` files).
- `useIsOperatorWhitelisted.ts` — domain hook returning `{ isWhitelisted: boolean, isLoading: boolean }` for the configured operator address. Used by the app shell to surface a critical error banner if the operator is not whitelisted (see §5.4).

### 3.6 Contract hooks to refactor

- `src/hooks/contracts/read/useReadContract.ts` — no change unless the underlying contract-address resolution signature changes.
- `src/hooks/contracts/read/useLotteryRead.ts` — keep; the Lottery ABI changes but the read-factory shape stays the same.
- `src/hooks/contracts/read/useFundsManagerRead.ts` — keep; FundsManager ABI is narrower in v2 (no rewards pot, ops pot, contributor pot) so some consumers will break.
- `src/hooks/contracts/lottery/useLotteryState.ts` — refactor to match the simpler v2 state surface. Remove any references to BPT, staking, referrals, discounts, or operations.
- `src/hooks/contracts/lottery/useLotteryEntry.ts` — refactor; the entry struct may have changed shape in v2 (re-derive with `abitype` from the new ABI).
- `src/hooks/contracts/lottery/useLotteryRound.ts`, `useLoadedGameRounds.ts`, `useMaxRoundsInPot.ts`, `usePlayerEntries.ts`, `useRoundEntryIndexes.ts`, `useRoundPurchases.ts`, `useRoundDraw.ts`, `useTimeRemaining.ts` — keep; audit for v1 field references and update against v2 ABIs.
- `src/hooks/contracts/lottery/actions/useEnterLottery.ts` — **major refactor**. Must now pass the `operator` parameter, compute the total `msg.value` as `(PEA + CF) * entries`, and the frontend layer (the caller of this hook) is responsible for separately sending the OF to the operator wallet. See §5.3.
- `src/hooks/entry/useEntryForm.ts` — refactor. Drop `useApplyReferralCode`, drop BPT balance/allowance hooks, drop discount logic. Add OF to the displayed cost breakdown.
- `src/hooks/contracts/transparency/` — audit. Delete hooks for contributor payouts/claim; keep hooks for contract balance display.

### 3.7 ABIs to delete

In `src/abi/`:

- `blockPotTokenAbi.ts`
- `blockPotRewardTrackerAbi.ts`
- `blockPotReferralManagerAbi.ts`
- `blockPotConfigManagerAbi.ts`
- `contributorsRewardTrackerAbi.ts`

### 3.8 ABIs to add

In `src/abi/`:

- `complianceRegistryAbi.ts` — synced from the contracts repo via `./sync-abis.sh`.

### 3.9 ABIs to refresh

Re-sync all surviving ABIs from the v2 contracts repo after its refactor is complete:

- `lotteryAbi.ts`
- `fundsManagerAbi.ts`
- `wethAbi.ts` (probably unchanged but verify)

Use `./sync-abis.sh ../unipot-contracts src/abi` per the existing workflow.

### 3.10 Contract name / address changes

In `src/constants/contract-addresses.ts`:

Remove from the `ContractName` enum:

- `BLOCK_POT_TOKEN`
- `CONFIG_MANAGER`
- `BLOCK_POT_REWARD_TRACKER`
- `BLOCK_POT_REFERRAL_MANAGER`
- `CONTRIBUTORS_REWARD_TRACKER`

Add to the `ContractName` enum:

- `COMPLIANCE_REGISTRY`
- (`QUICK_GAME` already exists in the enum — keep it; `LOTTERY_MAIN` also stays. Quick Game UI wiring is still out of scope as per v1, but the address should be populated.)

Update `getContractAddress` switch cases accordingly.

Update per-chain address maps in `src/constants/contract-addresses/{blockpot-testnet,arbitrum-testnet,polygon-testnet,local}.ts`:

- Remove deleted contract addresses.
- Add `COMPLIANCE_REGISTRY` address (populate from v2 deployment; if not yet deployed, use the zero address as a placeholder and flag in the PR description).

### 3.11 Components to delete

Delete the folders entirely:

- `src/components/blockpot/earn/`
- `src/components/blockpot/referrals/`
- `src/components/blockpot/governance/`

From `src/components/blockpot/header/`:

- Remove BPT balance display item.
- Remove any “earn” / “governance” / “referrals” nav links.
- Audit the wallet button — if it references BPT, clean up.

From `src/components/blockpot/modals/`:

- Delete `BPTDialog` (or equivalent BPT-balance modal).
- Delete any proposal-related dialogs.
- Keep `DrawSummary`, `PrizesOverview`, `MissedDraw`, `UnsupportedRegion`.

From `src/components/blockpot/entries/`:

- Remove the referral-code input.
- Remove the BPT-redemption discount toggle.
- Update the cost-breakdown display to show: PEA, CF (2%), OF (5%), total LEF. See §5.3.
- `useEntryForm` wiring changes — see §3.6.

From `src/components/blockpot/round-draw/`:

- Remove any “Start Draw” / “Trigger Draw” button or bounty-display UI.
- Keep the draw-animation / stages (Waiting / Drawing / Complete) — these are still valid.

From `src/components/blockpot/transparency/`:

- Delete contributor payout and contributor claim components.
- Keep contract-balance display components; audit against new FundsManager surface (the v2 FundsManager only tracks `_currentPot`, `_nextPot`, `_parentGamePot`).

From `src/components/blockpot/common/`:

- Delete `Token`, `TokenLabel` if only used for BPT.
- Keep `DrawnNumberTicket`, `HighlightDivider`, `LabeledBalance`, `RoundInfoStat`.

### 3.12 Components to add

- `src/components/blockpot/common/ResponsibleGamingPlaceholder.tsx` — minimal stub component (see §8).
- `src/components/blockpot/common/OperatorStatusBanner.tsx` - renders a blocking banner if the configured operator address is not whitelisted in `ApprovedOperatorRegistry`. See §5.4.

### 3.13 Types to delete

From `src/types/`:

- `governance/` folder entirely (`BlockpotProposal`, `ProposalStatus`, `ParameterType`)
- `web3/BlockpotTokenState`, `BlockpotRewardTrackerState` (if in separate files, delete; if co-located, strip)
- Any `lottery/` subtypes referencing BPT, staking, proposals, referrals, discounts

### 3.14 Utilities to delete

- `src/utilities/governance/` folder (proposalStatus, parameter-utils)
- `formatBPT` from `src/utilities/formatters.ts` (and call sites)

Keep: `formatEtherMaxDecimalsGreedy`, `formatEtherMaxDecimals`, `formatFixedMaxDecimals(Greedy)`, `formatUSDCurrency`, `formatCurrency`, `formatPercentage`, `formatNumber`, `formatAccountAddress`.

Keep the `lottery/` utility folder (results, `displayDrawnNumberData`, `ticketImage`), `time/`, `math/`, `query/idb-persister.ts`, `strings.ts`, `locale.ts`, `retry.ts`, `binding.ts`.

-----

## 4. Environment & Constants Changes

### 4.1 New env vars

Add to `.env.example`:

```
# The BlockpotOperator operator wallet address. Must be whitelisted in ApprovedOperatorRegistry
# on the target network, otherwise the frontend will display a blocking
# operator-status banner and entry submission will be disabled.
VITE_OPERATOR_ADDRESS=0x0000000000000000000000000000000000000000

# Operator Fee rate in basis points. 500 = 5%. Default for Blockpot's own
# BlockpotOperator is 500. Third-party operators deploying this frontend can adjust.
VITE_OPERATOR_FEE_BPS=500
```

### 4.2 Startup validation

At app startup (inside `Web3Provider` or a dedicated bootstrap hook), validate:

- `VITE_OPERATOR_ADDRESS` is set and is a valid EVM address. If not, log a loud console error and render a full-page error state instead of the app. Do not silently default to the zero address.
- `VITE_OPERATOR_FEE_BPS` is a positive integer ≤ 2000 (20% ceiling — a sanity guard, nothing more). Default to 500 if unset.

### 4.3 Remove env vars

Remove from `.env.example` and from `Web3Provider` consumption:

- `VITE_PINATA_API_KEY`
- `VITE_PINATA_API_SECRET`

Keep:

- `VITE_APP_MODE`
- `VITE_WALLETCONNECT_PROJECT_ID`
- `VITE_MOCK_COUNTRY`

### 4.4 Protocol constants

New file `src/constants/protocol.ts`:

```ts
// Hardcoded in the v2 Lottery contract as PEA_PER_ENTRY = 0.001 ether.
// Mirrored here for client-side cost computation.
export const PEA_PER_ENTRY_WEI = 1_000_000_000_000_000n  // 0.001 ETH

// Hardcoded in the v2 Lottery contract as CF_BASIS_POINTS = 200 (2%).
export const CF_BASIS_POINTS = 200n

// Read from VITE_OPERATOR_FEE_BPS at runtime; this is the static default.
export const DEFAULT_OF_BASIS_POINTS = 500n

export const BASIS_POINTS_DIVISOR = 10_000n
```

-----

## 5. Detailed Specifications

### 5.1 Provider stack (`src/routes/__root.tsx`)

Remove from the stack:

- `PinataStorageProvider`

Refactor (keep in place but internally narrowed):

- `LotteryProvider` — aggregates only round state; drop token/tracker/config/proposal aggregation.
- `BlockpotEventsProvider` — drop subscriptions to deleted events.

Add nothing new to the provider tree. The operator-status check (§5.4) is a component inside the shell, not a provider.

Final provider stack (outer to inner):

1. `CountryProvider`
1. `QueryClientProvider`
1. `Web3Provider`
1. `Web3ConnectionProvider`
1. `TransactionsProvider`
1. `SelectedGameProvider`
1. `ModalOpenStateProvider`
1. `BlockpotEventsProvider`
1. `BlockpotProvider`
1. `MissedDrawProvider`
1. `LotteryProvider`
1. `BlockpotDrawProvider`

Inside the shell, above `<Outlet />`: `<OperatorStatusBanner />`. Outside everything: `<Toaster />` from Sonner (unchanged).

### 5.2 Play route surface (`/play`)

What survives in `src/components/blockpot/play/`:

- `current-round/` — countdown, jackpot amount, prize tier badges, round info. Keep; strip any BPT rewards display.
- `drawn-numbers-panel/` — keep as-is.
- `round-draw/` — keep draw animation; remove start-draw button.
- `entries/` — major refactor (§5.3).
- `previous-rounds/` — keep.
- `info-panel/` — keep user stats / purchase history; strip BPT rewards and referral stats.

New placement (see §8): `<ResponsibleGamingPlaceholder />` rendered in the play route footer area with a visible `TODO` comment.

### 5.3 Entry flow refactor

This is the most sensitive part of the refactor. Get this right.

**User-visible cost breakdown in the entries form:**

For N entries:

```
PEA       = N × 0.001 ETH                  (goes to prize pool)
CF        = PEA × 2%                       (paid to protocol contributor)
OF        = PEA × (VITE_OPERATOR_FEE_BPS / 10000)   (paid to operator — this frontend)
─────────────────────────────────────
Total LEF = PEA + CF + OF
```

Display all four lines in the cost breakdown UI. Label them clearly — do not use acronyms in the UI; use full phrases:

- “Entry amount (to prize pool)”
- “Protocol fee (2%)”
- “Operator fee (5%)”
- “Total”

**Transaction structure:**

The v2 `Lottery.enter(operator, ...)` function expects `msg.value = PEA + CF` (the protocol side of the LEF — the CF is routed from the Lottery to DevCo; the PEA goes to FundsManager). The OF must be sent to the operator wallet **separately** by the frontend.

Implementation options (recommend option A; confirm in PR review):

**Option A (recommended, simpler):** Two transactions.

1. Frontend sends `OF` in ETH directly from the user’s wallet to the configured operator address. Use `viem`’s `sendTransaction` or the wagmi equivalent. Track via `useTrackedContractWrite`-equivalent for plain transfers or a new `useTrackedTransfer` hook.
1. On success, frontend submits the `Lottery.enter(operator, ...)` call with `msg.value = PEA + CF`.

Downside: two wallet prompts per ticket purchase. User friction.

**Option B (single-tx via a thin frontend router contract):** Deploy a thin contract (`BlockpotOperatorRouter`) that receives `msg.value = PEA + CF + OF`, takes the OF, and forwards `PEA + CF` as a call to `UnipotDraw.enter`. One wallet prompt. Cleaner UX. Requires a new contract deployment and trust in it, but since it’s operator-controlled that’s fine.

**For this refactor:** implement option A. Flag option B as a potential follow-up in the PR description. The extra prompt is an acceptable first-cut tradeoff against scope creep.

**Updated `useEnterLottery`:**

```ts
// Pseudocode — conform to existing hook style.
function useEnterLottery() {
  const operator = useOperatorAddress()  // from env
  const ofBps = useOperatorFeeBps()      // from env
  const { writeAsync: enterWrite } = useTrackedContractWrite({ ... })
  const { sendTransactionAsync } = useSendTransaction()

  async function enter({ entries, beneficiary }) {
    const pea = PEA_PER_ENTRY_WEI * BigInt(entries)
    const cf  = (pea * CF_BASIS_POINTS) / BASIS_POINTS_DIVISOR
    const of  = (pea * ofBps)            / BASIS_POINTS_DIVISOR

    // Step 1: OF transfer to operator wallet.
    await sendTransactionAsync({
      to: operator,
      value: of,
    }, 'Paying operator fee')

    // Step 2: enter the lottery.
    return enterWrite(
      [operator, beneficiary ?? userAddress, /* other args per v2 ABI */],
      'Buying tickets',
      { value: pea + cf }
    )
  }

  return { enter, /* status fields */ }
}
```

Derive the exact `enter` argument list from the synced v2 `lotteryAbi.ts`; do not assume from v1.

**Atomicity and failure handling:**

- If step 1 fails, do not proceed to step 2.
- If step 1 succeeds but step 2 fails, the user has paid OF but received no tickets. Surface this clearly in the UI as a refund-required state. Add a TODO comment and a brief user-facing message: “Operator fee was paid but ticket purchase failed. Please contact support for a refund.” This is a known limitation of Option A and a major argument for moving to Option B later.

**Remove from the entry form:**

- Referral code input
- BPT redemption toggle and BPT balance display
- Any discount calculation
- Any approval-for-BPT-allowance logic

### 5.4 Operator status banner (`OperatorStatusBanner`)

**Component contract:**

```tsx
// src/components/blockpot/common/OperatorStatusBanner.tsx
// Renders nothing if the configured operator is whitelisted in ApprovedOperatorRegistry.
// Renders a blocking red banner if not whitelisted, and disables entry submissions
// (the check is also enforced in useEnterLottery).
export function OperatorStatusBanner(): JSX.Element | null { ... }
```

**Behavior:**

- Calls `useIsOperatorWhitelisted()`.
- If `isLoading` → render nothing (do not flash an error during the initial RPC round-trip).
- If whitelisted → render nothing.
- If not whitelisted → render a full-width banner with a clear message: “This site is temporarily unavailable. Please check back later.” Do not expose internal details (whitelist status, compliance entity, etc.) to end users. Log a more verbose message to the console for operators.
- Also gate `useEnterLottery` on the whitelist status: if not whitelisted, `enter` rejects immediately with a user-facing error.

### 5.5 Transparency route

Keep the route; simplify the surface:

- Display contract balances for `Lottery`, `FundsManager`, `BlockpotRewardLostAndFound` (useful for the “failed payouts are recoverable” story).
- Display the `ApprovedOperatorRegistry` contract address with a read-only view of whitelisted operators (pulled via `getWhitelistedOperators()`). This actively reinforces the “licensed operators only” story.
- Delete all contributor payout and contributor claim UI.
- Delete any staking / rewards / reward-tracker displays.

Copy pass (§6) applies here in particular — the page shouldn’t read as “community transparency” but as “on-chain verifiability for licensed operation.”

-----

## 6. Copy Pass

A full copy pass is required. The v1 frontend is saturated with community / governance / staking / referral / BPT language. Sweep all of it.

**Search-and-remove terms (plain-language regex targets):**

- “BPT”, “Blockpot Token” (unless referring to the brand/product name in a neutral way)
- “Stake”, “Staking”, “Staker”, “Unstake”
- “Reward(s)” used in the staking / reward-tracker sense (keep “prize” and “winnings” and “winner”)
- “Governance”, “Proposal”, “Vote”, “Voting”, “Quorum”
- “Refer”, “Referral”, “Affiliate”, “Referrer”, “Referee”
- “Community-owned”, “Community-driven”, “Powered by the community”
- “Earn (BPT|rewards|a share)”
- “Start the draw”, “Trigger the draw” in user-facing contexts (draws are triggered by operator infrastructure, not users)
- “Contributor” in user-facing contexts (internal contributor concepts remain technical, but don’t surface them to players)

**Replacement guidance:**

- Overall framing: “licensed prize draw operator, powered by Unipot Protocol,” “provably fair draws on-chain,” “instant automatic payouts.” These map to the user-visible value proposition without invoking community-ownership.
- The brand tagline “Powered by People, Driven by Blockchain” appears in the brand guidelines but is protocol-level positioning. For the operator frontend, prefer operator-positioning taglines in marketing surface; keep any tagline usage restrained to footer/about-style placements.
- Where the v1 copy says things like “As a BPT staker you earn a share of every ticket sold,” delete the claim entirely — do not replace with anything.
- Where headings named deleted features (e.g. “Earn”, “Governance”, “Referrals” as nav items), remove the nav entries.

**Meta / SEO / social:**

- Update `index.html` title, meta description, OG tags if they reference deleted features.
- Update any hard-coded strings in `src/routes/__root.tsx` shell or in feature components.
- Audit Storybook stories — delete stories for deleted components; update copy in surviving stories.

**How to execute the copy pass:**

Claude Code should do this in a dedicated commit after the structural refactor compiles cleanly. Process:

1. Run a repo-wide grep for the terms above (case-insensitive). Capture the file list.
1. Open each file, evaluate the context, make targeted edits. Do not do blind find-and-replace.
1. Run `bun typecheck` and `bun lint` after the copy pass — no type or lint errors introduced.
1. Spot-check in dev mode (`bun dev`) across `/play`, `/transparency`, `/how-to-play`, and the header/footer.
1. Flag anything ambiguous to Stefan rather than guessing the new wording.

### 6.1 Specific copy files likely to need major rewrites

- `src/routes/how-to-play.tsx` and any content components it renders. This page currently explains BPT, staking, governance, and referrals. The v2 version should explain: (1) what a ticket is and how much it costs, (2) how draws work (Chainlink VRF, on-chain verifiable), (3) how payouts work (automatic, immediate), (4) fees breakdown (PEA / CF / OF — plain language).
- Any empty-state and tooltip copy in `entries/`, `info-panel/`, `current-round/`.
- Footer copy in `navigation/`.

-----

## 7. Execution Order

Work in this order. After each phase, run `bun typecheck`, `bun lint`, and `bun build` before moving on. The app will not dev-run cleanly until Phase 5 — that is expected.

### Phase 1: ABI sync and deletion sweep

1. Confirm contracts repo refactor is merged. Sync v2 ABIs:
   
   ```
   ./sync-abis.sh ../unipot-contracts src/abi
   ```
1. Delete the ABIs listed in §3.7.
1. Delete the routes listed in §3.1.
1. Delete the feature-component folders listed in §3.11.
1. Delete the provider files listed in §3.3 (`PinataStorageProvider`, `SettingsProvider`).
1. Delete the hook trees listed in §3.4.
1. Delete the types listed in §3.13.
1. Delete the utilities listed in §3.14.
1. Run `bun typecheck`. Expect many errors. Note them by file, group them, do not fix yet.

### Phase 2: Constants, env, and contract wiring

1. Update `src/constants/contract-addresses.ts`: remove deleted `ContractName` entries, add `COMPLIANCE_REGISTRY`, update `getContractAddress` switch.
1. Update every per-chain address map in `src/constants/contract-addresses/`.
1. Create `src/constants/protocol.ts` per §4.4.
1. Update `.env.example` per §4.1 and §4.3.
1. Add startup env validation per §4.2.
1. Add `src/abi/complianceRegistryAbi.ts` (from sync-abis output).
1. Run `bun typecheck`. Expect the hook layer to still fail.

### Phase 3: Hook layer refactor

1. Add `src/hooks/contracts/compliance-registry/useApprovedOperatorRegistryRead.ts`, `useIsOperatorWhitelisted.ts`.
1. Refactor `useEnterLottery` per §5.3.
1. Refactor `useEntryForm` to drop referral/BPT/discount wiring and add OF display.
1. Refactor `useLotteryState`, `useLotteryEntry`, and any round-fetching hooks against the v2 ABI.
1. Refactor `LotteryProvider` to narrow its aggregation.
1. Audit `BlockpotEventsProvider` event subscriptions against the v2 ABI; drop subscriptions to deleted events.
1. Delete/update transparency hooks per §3.6.
1. Run `bun typecheck`. Expect component-layer failures.

### Phase 4: Component layer refactor

1. Update `src/routes/__root.tsx` provider stack per §5.1.
1. Update the header component per §3.11.
1. Update modals per §3.11 (delete BPT / governance dialogs).
1. Refactor the entries form to match the new cost breakdown (§5.3).
1. Remove the start-draw button from `round-draw/`.
1. Simplify the transparency route per §5.5.
1. Add `OperatorStatusBanner` and wire into the shell.
1. Add `ResponsibleGamingPlaceholder` (§8) and place in the play route.
1. Delete Storybook stories for deleted components.
1. Run `bun typecheck`, `bun lint`, `bun build`. All must pass by the end of this phase. If any don’t, stop and ask before improvising.

### Phase 5: Copy pass

1. Execute the copy pass per §6. Commit separately from the structural refactor so the copy changes are reviewable in isolation.
1. Update `how-to-play` content substantially.
1. Update meta tags / `index.html`.
1. Spot-check in `bun dev`.

### Phase 6: CLAUDE.md and ARCHITECTURE.md updates

1. Apply the `CLAUDE.md` edits proposed in §15 of the architecture file (Vite/TanStack framing, removed legacy tree, etc.).
1. Additionally update `CLAUDE.md` to reflect v2:
- Delete references to BPT, staking, governance, referrals, contributor rewards.
- Add a “v2 BlockpotOperator frontend” framing paragraph.
- Add `ApprovedOperatorRegistry` to the contract list.
- Add the env vars from §4.1.
- Document the entry flow (two-transaction, PEA+CF to protocol, OF to operator).
1. Update `ARCHITECTURE.md` to reflect v2. Keep the existing section structure. Strip everything deleted, add new sections for `ApprovedOperatorRegistry`, operator fee handling, and the operator-status banner.

### Phase 7: Final verification

1. `bun typecheck` — clean.
1. `bun lint` — zero warnings (the repo is configured `--max-warnings 0`).
1. `bun build` — clean.
1. `bun storybook` — all surviving stories render without errors.
1. Spot-check in `bun dev` on the `blockPotTestnet` chain (or local Hardhat if testnet not yet redeployed):
- Wallet connection works.
- Operator-status banner behaves correctly (test with both a whitelisted and non-whitelisted operator address).
- Entry flow: two wallet prompts, OF arrives at operator address, entry confirms on-chain.
- Previous rounds, current round, and transparency pages render without console errors.
1. Generate `REFACTOR_SUMMARY.md` at the repo root listing:
- Routes deleted.
- Feature folders deleted (with line-count totals).
- Hook trees deleted.
- ABIs deleted / added.
- Files heavily refactored.
- Net LOC delta.
- Known limitations carried forward (two-wallet-prompt entry flow; KYC/AML + responsible-gaming out of scope).

-----

## 8. Out of Scope (do not do these)

The following are deliberately excluded from this refactor and will be handled in separate workstreams:

- **KYC/AML integration** (Sumsub, Chainalysis, or any other vendor). No SDK wiring. No identity gates. No wallet screening. No geolocation-based user blocking beyond what `CountryProvider` already does.
- **Responsible gaming features.** No self-exclusion, deposit limits, session time limits, age gates, or problem-gambling help copy beyond a single placeholder component (see below).
- **Fiat onramp / Google Pay integration.** Crypto-only.
- **Quick Game UI.** Contract addresses stay populated; no UI wiring.
- **Third-party BlockpotOperator support.** This frontend is for Blockpot’s own BlockpotOperator. Fork-and-rebrand is a future concern.
- **Internationalization.** Copy is English-only.
- **Mobile-specific UX work.** Responsive layout should continue to work but no mobile-first redesigns.

### 8.1 Responsible Gaming placeholder

Add `src/components/blockpot/common/ResponsibleGamingPlaceholder.tsx`:

```tsx
// PLACEHOLDER — NOT PRODUCTION
// This component is a stand-in for responsible gaming features (self-exclusion,
// deposit limits, session time limits, age gate, problem-gambling resources).
// It must be replaced with real BlockpotOperator compliance UI before launch.
// See TODO.md in the repo root for the full BlockpotOperator compliance checklist.
export function ResponsibleGamingPlaceholder() {
  return (
    <div className="text-xs text-muted-foreground border border-dashed border-destructive/50 rounded p-3 mt-8">
      <strong>TODO: Responsible gaming features.</strong> Self-exclusion, deposit
      limits, age verification, and problem-gambling resources must be
      implemented before public launch.
    </div>
  )
}
```

Render it in `src/routes/play.tsx` at the bottom of the page. This will be visually unmissable in dev and impossible to forget.

### 8.2 TODO.md

Create `TODO.md` at the repo root:

```md
# Outstanding BlockpotOperator Compliance Features

This file tracks compliance and product features that are required for the
Blockpot BlockpotOperator frontend to go to production, and which are explicitly out of
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
      Out-of-repo. Owned by the operator Costa Rica entity's ops team.
- [ ] Monitoring and alerting for operator wallet balance (OF receipts,
      gas for keeper).
- [ ] Backend for customer support, refund handling (including the known
      OF-paid-but-entry-failed edge case).

## Known limitations to revisit

- [ ] Two-transaction entry flow (OF transfer + Lottery.enter). Consider
      migrating to a single-tx BlockpotOperator router contract to cut user friction.
```

-----

## 9. Definition of Done

The refactor is complete when:

- `bun typecheck` — clean.
- `bun lint` — zero warnings.
- `bun build` — clean.
- All deleted feature folders and files from §3 are gone.
- `ApprovedOperatorRegistry` ABI and hooks are integrated; operator-status banner works.
- Entry flow is two transactions (OF transfer + `Lottery.enter`), displaying PEA / CF / OF / total breakdown.
- Copy pass (§6) has been executed and committed separately.
- `CLAUDE.md` and `ARCHITECTURE.md` reflect v2.
- `TODO.md` exists at repo root.
- `ResponsibleGamingPlaceholder` is rendered on `/play`.
- `REFACTOR_SUMMARY.md` exists and is accurate.
- Branch `feat/v2-lgo-frontend` is pushed and ready for review.
- PR description summarizes: scope, the two-transaction tradeoff (and the future Option B router-contract path), the out-of-scope list, and links to the `TODO.md`.

Stefan will review and merge.