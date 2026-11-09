#!/usr/bin/env bash
set -e

PORT="${GCH_WEB_PORT:-5174}"
URL="http://localhost:${PORT}"
WEB_DIR="/opt/g4/worktrees/gch-web"
EXPECTED_BRANCH="main"

export GCH_ROOT="${GCH_ROOT:-/mnt/c/Users/caiod/.global-context}"
export GCH_LOGS_DIR="${GCH_LOGS_DIR:-${GCH_ROOT}/logs}"
export GCH_WEB_PORT="${PORT}"

echo -e "\e[1;36m🌐 Iniciando GCH Web (${EXPECTED_BRANCH})...\e[0m"

if [ ! -d "$WEB_DIR" ]; then
  echo -e "\e[1;31m❌ Diretório não encontrado: ${WEB_DIR}\e[0m" >&2
  exit 1
fi

cd "$WEB_DIR"

# Carrega .env se existir
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  export GCH_WEB_PORT="${GCH_WEB_PORT:-$PORT}"
  PORT="${GCH_WEB_PORT}"
  URL="http://localhost:${PORT}"
fi

CURRENT_BRANCH="$(git branch --show-current 2>/dev/null || true)"
if [ -n "$CURRENT_BRANCH" ] && [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]; then
  echo -e "\e[1;33m🔀 Branch atual: ${CURRENT_BRANCH}. Esperado: ${EXPECTED_BRANCH} (seguindo mesmo assim)...\e[0m"
fi

if curl -s -f "$URL" > /dev/null 2>&1 || ss -tlnp 2>/dev/null | grep -q ":${PORT} "; then
  echo -e "\e[1;33m♻️  Reiniciando servidor na porta ${PORT}...\e[0m"
  if command -v fuser > /dev/null 2>&1; then
    fuser -k "${PORT}/tcp" > /dev/null 2>&1 || true
  else
    PIDS="$(ss -tlnp 2>/dev/null | awk -v p=":${PORT}" '$4 ~ p {print}' | grep -oP 'pid=\K[0-9]+' | sort -u)"
    for pid in $PIDS; do
      kill "$pid" 2>/dev/null || true
    done
  fi
  sleep 0.5
fi

echo -e "\e[1;33m⚡ Subindo Vite dev server...\e[0m"
nohup npm run dev > /tmp/gch-web-dev.log 2>&1 &

RETRIES=30
while [ $RETRIES -gt 0 ]; do
  if curl -s -f "$URL" > /dev/null 2>&1; then
    break
  fi
  sleep 0.5
  RETRIES=$((RETRIES - 1))
done

if ! curl -s -f "$URL" > /dev/null 2>&1; then
  echo -e "\e[1;31m❌ Vite não subiu a tempo. Veja /tmp/gch-web-dev.log\e[0m" >&2
  exit 1
fi

COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo '?')"
echo -e "\e[1;32m✅ GCH Web ativo em: \e[4;34m${URL}\e[0m"
echo -e "\e[1;32m   ${CURRENT_BRANCH:-no-git} @ ${COMMIT}\e[0m"
echo -e "\e[1;32m   GCH_ROOT=${GCH_ROOT}\e[0m"

if command -v xdg-open > /dev/null 2>&1; then
  xdg-open "$URL" > /dev/null 2>&1 &
elif command -v sensible-browser > /dev/null 2>&1; then
  sensible-browser "$URL" > /dev/null 2>&1 &
elif command -v google-chrome > /dev/null 2>&1; then
  google-chrome "$URL" > /dev/null 2>&1 &
fi
