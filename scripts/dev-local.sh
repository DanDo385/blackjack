#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PRIVATE_KEY_DEFAULT="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
TREASURY_ADDR_DEFAULT="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
RPC_URL="http://127.0.0.1:8545"

FRONTEND_PID=""
ANVIL_PID=""

cleanup() {
  local exit_code=$?
  echo "\nShutting down dev environment..."
  if [[ -n "$FRONTEND_PID" ]] && ps -p "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
  # Kill any process using port 3000 (Next.js)
  lsof -ti:3000 | xargs kill -9 >/dev/null 2>&1 || true
  if [[ -n "$ANVIL_PID" ]] && ps -p "$ANVIL_PID" >/dev/null 2>&1; then
    kill "$ANVIL_PID" >/dev/null 2>&1 || true
  fi
  exit "$exit_code"
}
trap cleanup EXIT INT TERM

# Check required commands
for cmd in anvil forge curl npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Required command '$cmd' is not available in PATH." >&2
    exit 1
  fi
done

start_anvil() {
  echo "Starting Anvil local chain..."
  (cd "$ROOT_DIR/contracts" && anvil --host 127.0.0.1 --port 8545 --block-time 1 >/tmp/anvil.log 2>&1) &
  ANVIL_PID=$!
  until curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' "$RPC_URL" >/dev/null; do
    echo "Waiting for Anvil to be ready..."
    sleep 2
  done
}

start_anvil

sanitize_output() {
  sed $'s/\x1b\[[0-9;]*m//g'
}

PRIVATE_KEY="${PRIVATE_KEY:-$PRIVATE_KEY_DEFAULT}"
TREASURY_ADDR="${TREASURY_ADDR:-$TREASURY_ADDR_DEFAULT}"

export PRIVATE_KEY

echo "Compiling and deploying contracts to local Anvil..."
echo "Running: forge script script/DeployFactory.s.sol..."

# Deploy Factory contract
set +e
FACTORY_OUTPUT=$(cd "$ROOT_DIR/contracts" && forge script script/DeployFactory.s.sol --rpc-url "$RPC_URL" --broadcast --private-key "$PRIVATE_KEY" --skip-simulation 2>&1 | sanitize_output)
FACTORY_DEPLOY_STATUS=$?
set -e

if [ $FACTORY_DEPLOY_STATUS -ne 0 ]; then
  echo "Factory deployment failed with exit code: $FACTORY_DEPLOY_STATUS"
  echo "Output:"
  echo "$FACTORY_OUTPUT"
  exit 1
fi

echo "Factory deployment completed successfully"

FACTORY_ADDR=$(echo "$FACTORY_OUTPUT" | sed -En 's/.*Factory: *(0x[0-9a-fA-F]{40}).*/\1/p' | tail -n1)
if [[ -z "$FACTORY_ADDR" ]]; then
  echo "Factory deployment output:"
  echo "$FACTORY_OUTPUT"
  echo "Failed to retrieve factory address from deployment." >&2
  exit 1
fi

echo "✓ Factory deployed at $FACTORY_ADDR"

# Wait a moment for Anvil to process the transaction
sleep 2

echo "Deploying tables..."
set +e
TABLE_OUTPUT=$(cd "$ROOT_DIR/contracts" && FACTORY_ADDR="$FACTORY_ADDR" TREASURY_ADDR="$TREASURY_ADDR" forge script script/DeployTables.s.sol --rpc-url "$RPC_URL" --broadcast --private-key "$PRIVATE_KEY" --skip-simulation 2>&1 | sanitize_output)
TABLE_EXIT_CODE=$?
set -e

if [ $TABLE_EXIT_CODE -ne 0 ]; then
  echo "Table deployment failed with exit code: $TABLE_EXIT_CODE"
  echo "Full output:"
  echo "$TABLE_OUTPUT"
  exit 1
fi

echo "Table deployment completed successfully"

# Parse table address (deployment script outputs "Table: 0x...")
TABLE_ADDR=$(echo "$TABLE_OUTPUT" | sed -En 's/.*Table: *(0x[0-9a-fA-F]{40}).*/\1/p' | tail -n1)

if [[ -z "$TABLE_ADDR" ]]; then
  echo ""
  echo "Full table deployment output:"
  echo "$TABLE_OUTPUT"
  echo ""
  echo "Failed to retrieve table address from deployment." >&2
  exit 1
fi

echo "✓ Table deployed at $TABLE_ADDR"

# For now, use the same table for both standard and premium
STD_TABLE_ADDR="$TABLE_ADDR"
PREM_TABLE_ADDR="$TABLE_ADDR"

echo "Updating frontend contract addresses..."
cat > "$ROOT_DIR/frontend/lib/contracts.ts" <<CONTRACTS_EOF
export const addresses = {
  factory: '$FACTORY_ADDR',
  tableStd: '$STD_TABLE_ADDR',
  tablePrem: '$PREM_TABLE_ADDR',
  treasury: '$TREASURY_ADDR',
} as const

export const abis = {
  table: [
    { "type":"function","name":"placeBet","inputs":[
      {"name":"token","type":"address"},
      {"name":"amount","type":"uint256"},
      {"name":"usdcRef","type":"uint256"},
      {"name":"quoteId","type":"bytes32"}],"outputs":[{"type":"uint256"}] },
    { "type":"function","name":"settle","inputs":[{"name":"handId","type":"uint256"}],"outputs":[] },
  ]
}
CONTRACTS_EOF

echo "Ensuring frontend dependencies are installed..."
if [[ ! -d "$ROOT_DIR/frontend/node_modules" ]]; then
  (cd "$ROOT_DIR/frontend" && npm install)
fi

ENV_FILE="$ROOT_DIR/frontend/.env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" <<EOF_ENV
NEXT_PUBLIC_CHAIN_ID=31337
EOF_ENV
  echo "Created frontend/.env.local"
else
  if ! grep -q '^NEXT_PUBLIC_CHAIN_ID=' "$ENV_FILE"; then
    echo 'NEXT_PUBLIC_CHAIN_ID=31337' >> "$ENV_FILE"
  fi
fi

echo "Starting Next.js frontend..."
# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 >/dev/null 2>&1 || true
sleep 1
(cd "$ROOT_DIR/frontend" && npm run dev > /tmp/blackjack-frontend.log 2>&1) &
FRONTEND_PID=$!
echo "Frontend logs: tail -f /tmp/blackjack-frontend.log"
sleep 3

echo "\nAll services are running:"
printf '  %-25s %s\n' "Anvil" "$RPC_URL"
printf '  %-25s %s\n' "Next.js" "http://localhost:3000"
echo

echo "Factory:      $FACTORY_ADDR"
echo "Std Table:    $STD_TABLE_ADDR"
echo "Premier Table: $PREM_TABLE_ADDR"
echo

echo "Press Ctrl+C to stop all services."

wait "$FRONTEND_PID"

