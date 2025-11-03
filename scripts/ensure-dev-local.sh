#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
MAX_RETRIES=20
RETRY_DELAY=3

echo "=========================================="
echo "Starting dev-local setup with retries"
echo "=========================================="
echo ""

cleanup() {
  echo ""
  echo "Cleaning up..."
  cd "$ROOT_DIR"
  make stop-dev >/dev/null 2>&1 || true
  killall anvil >/dev/null 2>&1 || true
  pkill -f "go run.*cmd/api" >/dev/null 2>&1 || true
  pkill -f "npm run dev" >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

RETRY_COUNT=0
SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$SUCCESS" = false ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  
  echo "----------------------------------------"
  echo "Attempt $RETRY_COUNT of $MAX_RETRIES"
  echo "----------------------------------------"
  
  # Clean up before retry
  cleanup
  sleep 2
  
  # Run make dev-local and capture output
  echo "Running: make dev-local"
  cd "$ROOT_DIR"
  
  # Run in background and monitor
  make dev-local > /tmp/dev-local-run.log 2>&1 &
  MAKE_PID=$!
  
  # Wait a bit for initialization
  sleep 8
  
  # Check if process is still running
  if ps -p $MAKE_PID >/dev/null 2>&1; then
    # Give it more time to complete setup
    echo "Waiting for services to start..."
    for i in {1..30}; do
      sleep 2
      
      # Check if make process exited
      if ! ps -p $MAKE_PID >/dev/null 2>&1; then
        wait $MAKE_PID 2>/dev/null || true
        EXIT_CODE=$?
        
        if [ $EXIT_CODE -eq 0 ]; then
          echo "✓ make dev-local completed successfully!"
          SUCCESS=true
          break
        else
          echo "✗ make dev-local exited with code $EXIT_CODE"
          echo "Last 30 lines of output:"
          tail -n 30 /tmp/dev-local-run.log || true
          break
        fi
      fi
      
      # Check for success indicators
      if docker ps | grep -q "blackjack-postgres.*healthy" && \
         docker ps | grep -q "blackjack-redis.*healthy" && \
         curl -s http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' >/dev/null 2>&1 && \
         [ -f "$ROOT_DIR/frontend/lib/contracts.ts" ] && \
         grep -q "factory: '0x[a-fA-F0-9]\{40\}'" "$ROOT_DIR/frontend/lib/contracts.ts" 2>/dev/null; then
        echo ""
        echo "✓ All services appear to be running!"
        echo "Services detected:"
        docker ps | grep -E "(blackjack|anvil)" || echo "  (containers running)"
        ps aux | grep -E "(anvil|go run)" | grep -v grep | head -3 || echo "  (processes running)"
        echo ""
        echo "Stopping make dev-local (services will continue)..."
        kill $MAKE_PID 2>/dev/null || true
        wait $MAKE_PID 2>/dev/null || true
        SUCCESS=true
        break
      fi
    done
  else
    wait $MAKE_PID 2>/dev/null || true
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
      echo "✓ make dev-local completed successfully!"
      SUCCESS=true
    else
      echo "✗ make dev-local failed immediately"
      echo "Output:"
      tail -n 50 /tmp/dev-local-run.log || true
    fi
  fi
  
  if [ "$SUCCESS" = false ] && [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo ""
    echo "Waiting $RETRY_DELAY seconds before retry..."
    sleep $RETRY_DELAY
  fi
done

if [ "$SUCCESS" = false ]; then
  echo ""
  echo "✗ Failed after $MAX_RETRIES attempts"
  echo "Check /tmp/dev-local-run.log for details"
  exit 1
fi

echo ""
echo "=========================================="
echo "✓ Dev environment is ready!"
echo "=========================================="
echo ""
echo "Verifying services:"
echo ""

# Verify services
if docker ps | grep -q "blackjack-postgres.*healthy"; then
  echo "  ✓ PostgreSQL: healthy"
else
  echo "  ✗ PostgreSQL: not healthy"
fi

if docker ps | grep -q "blackjack-redis.*healthy"; then
  echo "  ✓ Redis: healthy"
else
  echo "  ✗ Redis: not healthy"
fi

if curl -s http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' >/dev/null 2>&1; then
  echo "  ✓ Anvil: responding"
else
  echo "  ✗ Anvil: not responding"
fi

if [ -f "$ROOT_DIR/frontend/lib/contracts.ts" ]; then
  FACTORY=$(grep -oP "factory: '\K0x[a-fA-F0-9]{40}" "$ROOT_DIR/frontend/lib/contracts.ts" 2>/dev/null || echo "")
  if [ -n "$FACTORY" ] && [ "$FACTORY" != "0xFactory..." ]; then
    echo "  ✓ Contracts: deployed ($FACTORY)"
  else
    echo "  ✗ Contracts: not deployed"
  fi
else
  echo "  ✗ Contracts: file not found"
fi

echo ""
echo "Starting frontend development server..."
echo "Press Ctrl+C to stop all services."
echo ""

cd "$ROOT_DIR/frontend"
npm run dev
