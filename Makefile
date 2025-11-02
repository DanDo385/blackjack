.PHONY: dev dev-local dev-prod dev-hosted stop-dev
.PHONY: build test test-coverage test-gas test-specific
.PHONY: deploy-anvil deploy-factory deploy-tables clean-contracts

# Development environment targets
dev:
	./scripts/dev.sh

dev-local:
	./scripts/dev-local.sh

dev-hosted:
	./scripts/dev-hosted.sh

dev-prod:
	./scripts/dev-prod.sh

stop-dev:
	@docker compose -f docker-compose.dev.yml down 2>/dev/null || docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Contract build and test targets
build:
	@echo "Building contracts..."
	cd contracts && forge build

test:
	@echo "Running contract tests..."
	cd contracts && forge test -vv

test-coverage:
	@echo "Running tests with coverage..."
	cd contracts && forge coverage --report lcov && genhtml lcov.info -o coverage

test-gas:
	@echo "Running tests with gas reporting..."
	cd contracts && forge test --gas-report

test-specific:
	@echo "Usage: make test-specific TEST=<test_name>"
	@echo "Example: make test-specific TEST=test_PlaceBet"
	cd contracts && forge test --match-test $(TEST) -vv

# Deployment targets
deploy-anvil:
	@echo "Starting Anvil..."
	@anvil --host 127.0.0.1 --port 8545 --block-time 1 > /tmp/anvil.log 2>&1 &
	@echo "Anvil started. PID: $$!"

deploy-factory:
	@echo "Deploying Factory contract..."
	@if [ -z "$$PRIVATE_KEY" ]; then \
		echo "Error: PRIVATE_KEY environment variable is required"; \
		exit 1; \
	fi
	cd contracts && forge script script/DeployFactory.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key $$PRIVATE_KEY

deploy-tables:
	@echo "Deploying Table contracts..."
	@if [ -z "$$PRIVATE_KEY" ] || [ -z "$$FACTORY_ADDR" ] || [ -z "$$TREASURY_ADDR" ]; then \
		echo "Error: PRIVATE_KEY, FACTORY_ADDR, and TREASURY_ADDR environment variables are required"; \
		exit 1; \
	fi
	cd contracts && FACTORY_ADDR=$$FACTORY_ADDR TREASURY_ADDR=$$TREASURY_ADDR \
		forge script script/DeployTables.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key $$PRIVATE_KEY

clean-contracts:
	@echo "Cleaning contract artifacts..."
	cd contracts && forge clean
	rm -rf contracts/out contracts/cache contracts/coverage contracts/lcov.info
