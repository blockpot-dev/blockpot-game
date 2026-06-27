# Stage 1 — build the Vite SPA with Bun.
#
# Build (locally):
#   docker build \
#     --build-arg VITE_APP_MODE=STAGING \
#     --build-arg VITE_TESTNET_RPC_URL=... \
#     --build-arg VITE_WALLETCONNECT_PROJECT_ID=... \
#     --build-arg VITE_GAMING_SERVICE_URL=... \
#     --build-arg CHAINS_CONFIG="$(cat chains.json)" \
#     --build-arg BLOCKPOT_DESIGN_SYSTEM_PACKAGE_TOKEN=$GH_PKG_TOKEN \
#     -t bp-frontend .
#
# Build-time VITE_* env (all are inlined into the static bundle, so they
# must be present at `bun run build`):
#   VITE_APP_MODE=STAGING
#   VITE_TESTNET_RPC_URL
#   VITE_TESTNET_CHAIN_ID  (defaults to 69696 in code if unset)
#   VITE_WALLETCONNECT_PROJECT_ID
#   VITE_GAMING_SERVICE_URL
#   VITE_MAINNET_RPC_URL    (optional — overrides viem's default eth.merkle.io,
#                            which CORS-blocks browser origins)
#   VITE_ENABLE_TESTNET_FAUCET (optional — "true" renders the footer
#                              "Get test ETH" link on hosted testnet builds)
#
# Build-time CHAINS_CONFIG (required when VITE_APP_MODE=STAGING):
#   CHAINS_CONFIG   The unified JSON the testnet-deployer service writes to
#                   the project's shared variables. The build runs
#                   scripts/sync-addresses.js against it before `bun run
#                   build` so the contract-addresses TS file matches the
#                   currently-deployed contracts. Reference it in Railway as
#                   `${{ shared.CHAINS_CONFIG }}` with build-time access on.
#
# Build-time GitHub Packages token:
#   BLOCKPOT_DESIGN_SYSTEM_PACKAGE_TOKEN
#                           Read-only PAT for @blockpot-dev/* on
#                           npm.pkg.github.com. The tracked .npmrc references
#                           this env var at install time. Pass via --build-arg
#                           (Railway: regular service variable with the
#                           "Available at build time" toggle on). BuildKit
#                           --mount=type=secret would be tighter but Railway's
#                           Metal builder rejects everything except type=cache.
FROM oven/bun:1 AS build

WORKDIR /app

ARG VITE_APP_MODE
ARG VITE_TESTNET_RPC_URL
ARG VITE_TESTNET_CHAIN_ID
ARG VITE_WALLETCONNECT_PROJECT_ID
ARG VITE_GAMING_SERVICE_URL
ARG VITE_MAINNET_RPC_URL
ARG VITE_ENABLE_TESTNET_FAUCET
ARG CHAINS_CONFIG
ARG BLOCKPOT_DESIGN_SYSTEM_PACKAGE_TOKEN

# Promote ARGs to ENV so the build process (and scripts/sync-addresses.js)
# read them without shell-quoting hazards from the JSON's embedded quotes.
# This stage's ENV doesn't persist — stage 2 (`FROM nginx:alpine`) starts
# clean and only inherits the built dist/ via COPY --from.
ENV VITE_APP_MODE=$VITE_APP_MODE \
    VITE_TESTNET_RPC_URL=$VITE_TESTNET_RPC_URL \
    VITE_TESTNET_CHAIN_ID=$VITE_TESTNET_CHAIN_ID \
    VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID \
    VITE_GAMING_SERVICE_URL=$VITE_GAMING_SERVICE_URL \
    VITE_MAINNET_RPC_URL=$VITE_MAINNET_RPC_URL \
    VITE_ENABLE_TESTNET_FAUCET=$VITE_ENABLE_TESTNET_FAUCET \
    CHAINS_CONFIG=$CHAINS_CONFIG

COPY package.json bun.lock* .npmrc ./
# scripts/ has to land before `bun install` because package.json's
# `postinstall` hook is `bun scripts/copy-assets.js` — bun runs it as
# part of install, and the file has to exist at that point. Copying just
# scripts/ here (rather than `COPY . .`) keeps the install layer's cache
# key narrow: only changes under scripts/ (rare) bust node_modules
# caching. Other source changes still hit the COPY . . layer below.
COPY scripts ./scripts

# Pass the token inline (not via ENV) so it doesn't get baked into the
# stage's image-config metadata. `docker history --no-trunc` will show the
# substituted value for this RUN, which is acceptable for a private image
# with a scoped read-only token. Stage 2 (`FROM nginx:alpine`) discards
# stage 1 entirely, so the runtime image carries no trace of it.
RUN BLOCKPOT_DESIGN_SYSTEM_PACKAGE_TOKEN="$BLOCKPOT_DESIGN_SYSTEM_PACKAGE_TOKEN" \
    bun install --frozen-lockfile

COPY . .

# Sync the testnet contract-addresses TS file from CHAINS_CONFIG before
# `vite build` inlines it into the bundle. Required for STAGING builds —
# the operator's only source of truth for contract addresses on Railway is
# the shared variable that testnet-deployer maintains. Local builds that
# pre-sync addresses by hand can run with VITE_APP_MODE != STAGING and
# this step is skipped.
#
# CHAINS_CONFIG is intentionally NOT referenced in this RUN's command
# line — Docker pre-substitutes `$CHAINS_CONFIG` (and `${CHAINS_CONFIG:-}`)
# at parse time, and the JSON's embedded double-quotes break shell
# tokenisation when that substituted text is fed to /bin/sh. The ENV
# directive above puts CHAINS_CONFIG in the build container's
# environment, and node reads it via process.env — bypassing Docker's
# parser entirely. The script itself errors loudly if CHAINS_CONFIG is
# unset when --chains-config-json is passed, so a missing value still
# fails the build.
RUN if [ "$VITE_APP_MODE" = "STAGING" ]; then \
      echo "Syncing testnet addresses from CHAINS_CONFIG..."; \
      node scripts/sync-addresses.js \
        --chain="${VITE_TESTNET_CHAIN_ID:-69696}" \
        --chains-config-json; \
    else \
      echo "VITE_APP_MODE=$VITE_APP_MODE — skipping testnet address sync."; \
    fi

RUN bun run build

# Stage 2 — serve the built SPA with nginx.
FROM nginx:alpine AS runtime

# Drop the conf into /etc/nginx/templates/ so the official nginx entrypoint
# (`/docker-entrypoint.d/20-envsubst-on-templates.sh`) runs envsubst over it
# at container start and writes the rendered file to /etc/nginx/conf.d/.
# Restrict the substitution to $PORT so nginx-internal variables ($uri, $1,
# $http_*) survive the pass — the default behaviour replaces every $VAR it
# sees with whatever's in the env, blanking unknown ones.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV NGINX_ENVSUBST_FILTER_VARS=PORT
COPY --from=build /app/dist /usr/share/nginx/html

# EXPOSE is informational only — Railway routes traffic to whatever port
# the process binds to, which here will be $PORT after envsubst runs.
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
