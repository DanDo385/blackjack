.PHONY: dev dev-local dev-prod dev-hosted stop-dev

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
