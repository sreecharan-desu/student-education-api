#!/usr/bin/env bash
set -e

# ==============================================================================
# Student Education API - Local Startup Script
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "[STARTUP] Checking environment configuration..."
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "[WARN] .env not found. Copying .env.example to .env..."
    cp .env.example .env
  else
    echo "[ERROR] Neither .env nor .env.example found. Aborting."
    exit 1
  fi
fi

# Load environment variables safely
export $(grep -v '^#' .env | xargs)

# 1. Start Docker PostgreSQL container if Docker is installed and running
if command -v docker >/dev/null 2>&1; then
  if docker ps -a --format '{{.Names}}' | grep -q "^vidya-postgres$"; then
    if ! docker ps --format '{{.Names}}' | grep -q "^vidya-postgres$"; then
      echo "[DOCKER] Starting existing vidya-postgres container..."
      docker start vidya-postgres >/dev/null 2>&1 || true
    else
      echo "[DOCKER] Container vidya-postgres is already running."
    fi
  fi
fi

# 2. Generate Prisma Client
echo "[PRISMA] Generating Prisma client..."
npx prisma generate >/dev/null 2>&1

PORT="${PORT:-3001}"
HOST_IP="$(ipconfig getifaddr en0 2>/dev/null || echo '127.0.0.1')"

echo "============================================================="
echo "[SERVER] Starting NestJS + Fastify with Hot Reload (HMR)..."
echo "[LOCAL]   http://localhost:${PORT}/api/v1"
echo "[SWAGGER] http://localhost:${PORT}/api/docs"
echo "[WIFI]    http://${HOST_IP}:${PORT}/api/v1"
echo "[WIFI UI] http://${HOST_IP}:${PORT}/api/docs"
echo "============================================================="

exec npm run start:dev
