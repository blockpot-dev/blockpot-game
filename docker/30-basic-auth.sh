#!/bin/sh
# Pre-launch password gate for the nginx runtime image.
#
# Runs from /docker-entrypoint.d/ at container start, after the stock
# 20-envsubst-on-templates.sh has rendered nginx.conf.template. Writes two
# files the rendered config includes:
#
#   /etc/nginx/conf.d/00-gate-maps.conf   http-level `map`s (session cookie
#                                         check, query-string sign-in check)
#   /etc/nginx/basic-auth.conf            server-level auth directives
#
#   GAME_PASSWORD set    -> every path except /healthz and /robots.txt needs
#                           either HTTP basic auth (user GAME_USER, default
#                           "blockpot") or the bp_session cookie. The cookie
#                           is minted by visiting ?user=<GAME_USER>&pass=
#                           <GAME_PASSWORD> once; that is the link to hand
#                           internal testers.
#   GAME_PASSWORD unset  -> auth off; the site is public. No rebuild needed
#                           either way: change the variable and redeploy.
#
# The basic-auth file holds an apr1 hash, never the plaintext. The session
# token is sha256(user:password), so it survives redeploys and is useless
# without the password.
set -eu

MAPS=/etc/nginx/conf.d/00-gate-maps.conf
AUTH_CONF=/etc/nginx/basic-auth.conf
HTPASSWD=/etc/nginx/.htpasswd

if [ -z "${GAME_PASSWORD:-}" ]; then
  cat > "$MAPS" <<CONF
map \$cookie_bp_session \$bp_realm { default off; }
map "\$arg_user:\$arg_pass" \$bp_login { default 0; }
CONF
  cat > "$AUTH_CONF" <<CONF
set \$bp_gated 0;
set \$bp_token "";
auth_basic off;
CONF
  echo "gate: disabled (GAME_PASSWORD not set); site is public"
  exit 0
fi

user="${GAME_USER:-blockpot}"

# Query-string sign-in compares raw \$arg_* values (nginx does not
# URL-decode them) inside a quoted nginx string, so only [A-Za-z0-9_.-]
# is supported there. Anything else still works for basic auth, just not
# for the ?user=&pass= link.
case "$user$GAME_PASSWORD" in
  *[!A-Za-z0-9_.-]*)
    login_line='map "$arg_user:$arg_pass" $bp_login { default 0; }'
    echo "gate: WARNING user/password contain characters outside [A-Za-z0-9_.-]; ?user=&pass= sign-in disabled, basic auth still active"
    ;;
  *)
    login_line="map \"\$arg_user:\$arg_pass\" \$bp_login { default 0; \"$user:$GAME_PASSWORD\" 1; }"
    ;;
esac

token="$(printf '%s:%s' "$user" "$GAME_PASSWORD" | openssl dgst -sha256 | sed 's/^.*= *//')"
hash="$(openssl passwd -apr1 "$GAME_PASSWORD")"

printf '%s:%s\n' "$user" "$hash" > "$HTPASSWD"
# The master runs as root but the workers run as `nginx`, and it is the
# workers that open this file per request. Root-only perms give every
# authenticated request a 500 (Permission denied in the error log).
chown root:nginx "$HTPASSWD"
chmod 0640 "$HTPASSWD"

cat > "$MAPS" <<CONF
# A valid session cookie switches auth_basic off for the request.
map \$cookie_bp_session \$bp_realm { default "Blockpot"; "$token" off; }
$login_line
CONF

cat > "$AUTH_CONF" <<CONF
set \$bp_gated 1;
set \$bp_token "$token";
auth_basic \$bp_realm;
auth_basic_user_file $HTPASSWD;
CONF

echo "gate: enabled for user '$user' (unset GAME_PASSWORD to open the site)"
