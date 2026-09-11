# Overview
The frontend for Blockpot.

## Development
```bash
yarn dev
```
## Pre-launch password gate

The nginx runtime image gates every request with HTTP basic auth while the
Railway variable `GAME_PASSWORD` is set (username `GAME_USER`, default
`blockpot`). Unset the variable and redeploy to open the site; no code
change. `/healthz` is always open so Railway's healthcheck passes either way.
Implementation: `docker/30-basic-auth.sh` and the `include` in
`nginx.conf.template`.
