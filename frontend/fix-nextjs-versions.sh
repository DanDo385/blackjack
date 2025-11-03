#!/bin/bash
# Fix mixed Next.js versions and deploymentId errors
# Run this from the frontend directory

set -e

echo "🔧 Fixing Next.js version conflicts..."
echo ""

# Step 1: Stop any running Next.js dev server
echo "📋 Step 1: Stopping dev server (if running)..."
pkill -f "next dev" || true
sleep 1

# Step 2: Remove build artifacts and dependencies
echo "📋 Step 2: Cleaning build artifacts and node_modules..."
rm -rf .next
rm -rf node_modules
rm -f pnpm-lock.yaml

# Step 3: Clean pnpm store cache for Next.js
echo "📋 Step 3: Cleaning pnpm store cache..."
pnpm store prune || true

# Step 4: Reinstall dependencies
echo "📋 Step 4: Reinstalling dependencies..."
pnpm install

# Step 5: Verify only one Next.js version
echo ""
echo "📋 Step 5: Verifying Next.js version..."
NEXT_VERSIONS=$(pnpm list next 2>&1 | grep -E "next@[0-9]" | wc -l | tr -d ' ')
if [ "$NEXT_VERSIONS" -eq "1" ]; then
  echo "✅ Success: Only one Next.js version found"
  pnpm list next | grep "next@"
else
  echo "⚠️  Warning: Multiple Next.js versions detected"
  pnpm list next
fi

echo ""
echo "✅ Cleanup complete! Next steps:"
echo "   1. Run 'pnpm dev' to start the dev server"
echo "   2. Test the 'Place Bet' button"
echo "   3. Check console for deploymentId errors (should be gone)"

