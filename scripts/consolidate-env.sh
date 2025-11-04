#!/bin/bash
# Consolidate .env files script
# Merges frontend/.env.local into root .env and creates symlink

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Consolidating .env files..."

# Create root .env.example if it doesn't exist
if [[ ! -f "$ROOT_DIR/.env.example" ]]; then
    cat > "$ROOT_DIR/.env.example" <<'EOF'
# YOLO Blackjack - Consolidated Environment Configuration
# All components (backend, frontend, contracts) read from root .env

# Blockchain Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
TABLE_ADDRESS=  # Auto-populated from Foundry broadcast if available
TREASURY_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Backend Configuration
POSTGRES_DSN=postgres://postgres:postgres@localhost:5432/yolo?sslmode=disable
REDIS_ADDR=localhost:6379
FRONTEND_URL=http://localhost:3000

# Frontend Configuration (Next.js)
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_RPC_HTTP_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337

# Foundry Configuration
CHAIN_NAME=anvil
EOF
    echo "Created .env.example"
fi

# Merge frontend/.env.local into root .env if it exists
if [[ -f "$ROOT_DIR/frontend/.env.local" ]]; then
    echo "Merging frontend/.env.local values into root .env..."
    
    # Read frontend env vars
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        
        # Remove quotes if present
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        # Add to root .env if not already present
        if ! grep -q "^${key}=" "$ROOT_DIR/.env" 2>/dev/null; then
            echo "${key}=${value}" >> "$ROOT_DIR/.env"
        fi
    done < "$ROOT_DIR/frontend/.env.local"
    
    echo "✅ Merged frontend/.env.local into root .env"
fi

# Create symlink from frontend/.env.local to root .env
if [[ -f "$ROOT_DIR/.env" ]] && [[ ! -L "$ROOT_DIR/frontend/.env.local" ]]; then
    echo "Creating symlink: frontend/.env.local -> .env"
    ln -sf "$ROOT_DIR/.env" "$ROOT_DIR/frontend/.env.local"
    echo "✅ Created symlink"
fi

echo ""
echo "✅ .env consolidation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit root .env file with your configuration"
echo "   2. frontend/.env.local now points to root .env (via symlink)"
echo "   3. Backend automatically loads root .env"
echo "   4. Contract addresses are auto-loaded from Foundry broadcast files"
echo ""

