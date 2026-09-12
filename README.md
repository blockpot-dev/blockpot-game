# Overview
The frontend for Blockpot.

## Development
```bash
yarn dev
```
## Pre-launch password gate

The nginx runtime image gates every request while the Railway variable
`GAME_PASSWORD` is set (username `GAME_USER`, default `blockpot`). Two ways
in:

- **Tester link:** `https://beta.blockpot.com/?user=<GAME_USER>&pass=<GAME_PASSWORD>`
  sets a 12-hour session cookie and redirects to `/` with the credentials
  stripped from the URL. Share this internally.
- **Browser prompt:** plain HTTP basic auth with the same credentials.

Unset the variable and redeploy to open the site; no code change. While
gated the served `index.html` has its title suffix and description blanked
and a `noindex` meta injected, every response carries `X-Robots-Tag:
noindex`, `/robots.txt` disallows everything, and the 401 page is a neutral
"LOCKED" readout. `/healthz` is always open so Railway's healthcheck passes.

Implementation: `docker/30-basic-auth.sh`, `docker/401.html`, and the maps
plus `include` in `nginx.conf.template`. The `?user=&pass=` link only works
when both values are `[A-Za-z0-9_.-]`; basic auth works regardless.
