// Reality-check nudge (B-RG-3, task 113) — client-only configuration bounds.
// The interval is player-configurable on /responsible-gaming and persisted in
// localStorage; these are the operator defaults and clamps. There is no server
// state for reality check by design (task 99 removed it; task 113 rebuilt the
// nudge client-only).
export const REALITY_CHECK_DEFAULT_INTERVAL_MINUTES = 60
export const REALITY_CHECK_MIN_MINUTES = 15
export const REALITY_CHECK_MAX_MINUTES = 240
