#!/bin/sh
# Pre-launch password gate for the nginx runtime image.
#
# Runs from /docker-entrypoint.d/ at container start, after the stock
# 20-envsubst-on-templates.sh has rendered nginx.conf.template. It writes
# /etc/nginx/basic-auth.conf, which the server block includes:
#
#   GAME_PASSWORD set    -> HTTP basic auth on every path except /healthz.
#                           Username is GAME_USER (default "blockpot").
#   GAME_PASSWORD unset  -> auth_basic off; the site is public. No rebuild
#                           needed either way: change the variable and
#                           redeploy.
#
# The password is hashed with apr1 at start so the plaintext never touches
# disk; only the hash lands in /etc/nginx/.htpasswd.
set -eu

AUTH_CONF=/etc/nginx/basic-auth.conf
HTPASSWD=/etc/nginx/.htpasswd

if [ -n "${GAME_PASSWORD:-}" ]; then
  user="${GAME_USER:-blockpot}"
  hash="$(openssl passwd -apr1 "$GAME_PASSWORD")"
  umask 077
  printf '%s:%s\n' "$user" "$hash" > "$HTPASSWD"
  cat > "$AUTH_CONF" <<CONF
auth_basic "Blockpot";
auth_basic_user_file $HTPASSWD;
CONF
  echo "basic-auth: enabled for user '$user' (unset GAME_PASSWORD to open the site)"
else
  echo "auth_basic off;" > "$AUTH_CONF"
  echo "basic-auth: disabled (GAME_PASSWORD not set); site is public"
fi
