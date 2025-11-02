#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

FRONTEND_PID=""
BACKEND_PID=""

cleanup() {
  local exit_code=$?
  echo "\nShutting down hosted dev environment..."
  if [[ -n "$FRONTEND_PID" ]] && ps -p "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$BACKEND_PID" ]] && ps -p "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
  exit "$exit_code"
}
trap cleanup EXIT INT TERM

echo "=============================================="
echo "Running dev-hosted: Connecting to hosted services"
echo "=============================================="

# Check required commands
for cmd in go npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Required command '$cmd' is not available in PATH." >&2
    exit 1
  fi
done

# Check for required environment variables
if [[ -z "${POSTGRES_DSN:-}" ]]; then
  echo "WARNING: POSTGRES_DSN environment variable is not set." >&2
  echo "Set it via: export POSTGRES_DSN=postgres://user:pass@host:port/db" >&2
  echo "Continuing with default connection..." >&2
fi

if [[ -z "${REDIS_ADDR:-}" ]]; then
  echo "WARNING: REDIS_ADDR environment variable is not set." >&2
  echo "Set it via: export REDIS_ADDR=host:port" >&2
  echo "Continuing with default connection..." >&2
fi

# Test database connections
echo "Testing database connections..."

# Test PostgreSQL connection
export POSTGRES_DSN="${POSTGRES_DSN:-postgres://postgres:postgres@localhost:5432/yolo?sslmode=disable}"
if command -v psql >/dev/null 2>&1; then
  if ! psql "$POSTGRES_DSN" -c "SELECT 1" >/dev/null 2>&1; then
    echo "WARNING: Could not connect to PostgreSQL at $POSTGRES_DSN" >&2
    echo "Please verify your POSTGRES_DSN is correct and the database is accessible." >&2
  else
    echo "✓ PostgreSQL connection successful"
  fi
else
  echo "Note: psql not found, skipping PostgreSQL connection test"
fi

# Test Redis connection
export REDIS_ADDR="${REDIS_ADDR:-localhost:6379}"
if command -v redis-cli >/dev/null 2>&1; then
  if ! redis-cli -h "${REDIS_ADDR%:*}" -p "${REDIS_ADDR#*:}" ping >/dev/null 2>&1; then
    echo "WARNING: Could not connect to Redis at $REDIS_ADDR" >&2
    echo "Please verify your REDIS_ADDR is correct and Redis is accessible." >&2
  else
    echo "✓ Redis connection successful"
  fi
else
  echo "Note: redis-cli not found, skipping Redis connection test"
fi

echo "Ensuring frontend dependencies are installed..."
if [[ ! -d "$ROOT_DIR/frontend/node_modules" ]]; then
  (cd "$ROOT_DIR/frontend" && npm install)
fi

# Start backend API
echo "Starting Go API server..."
(cd "$ROOT_DIR/backend" && go run ./cmd/api) &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

echo "Starting Next.js frontend..."
(cd "$ROOT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo "\n=============================================="
echo "All services are running:"
printf '  %-25s %s\n' "PostgreSQL" "$POSTGRES_DSN"
printf '  %-25s %s\n' "Redis" "$REDIS_ADDR"
printf '  %-25s %s\n' "Go API" "http://localhost:8080"
printf '  %-25s %s\n' "Next.js" "http://localhost:3000"
echo "=============================================="
echo ""
echo "NOTE: Contracts are NOT deployed in dev-hosted mode."
echo "Make sure your frontend is configured with existing contract addresses."
echo ""
echo "Press Ctrl+C to stop all services."

wait "$FRONTEND_PID"

