.PHONY: compose-prod-config compose-prod-config-quiet compose-prod-ghcr-config validate-prod-env backup-prod monitor-prod

validate-prod-env:
	./scripts/validate-prod-env.sh $(ENV_FILE)

# Проверка production compose с placeholder env (без warnings)
compose-prod-config:
	./scripts/compose-prod-config.sh

compose-prod-config-quiet:
	./scripts/compose-prod-config.sh --quiet

compose-prod-ghcr-config:
	GHCR_OWNER=ci-org CYBEREDU_IMAGE_TAG=v0.0.0-ci \
		docker compose --env-file .env.prod.example \
		-f docker-compose.prod.yml -f docker-compose.prod.ghcr.yml config --quiet

# На VPS (требует .env.production и запущенный stack для uploads exec)
backup-prod:
	./scripts/backup-production.sh

monitor-prod:
	@test -n "$(BASE_URL)" || (echo "Usage: BASE_URL=https://your-domain make monitor-prod" && exit 1)
	CHECK_NGINX=1 ./scripts/monitor-health.sh
