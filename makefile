# =============================================================================
#  Makefile - Anteraja backend (Laravel + PHP-FPM + Nginx + PostgreSQL)
#  Pakai:  make help
# =============================================================================

SHELL := /bin/bash
.DEFAULT_GOAL := help

COMPOSE ?= docker compose
APP_SVC := app
WEB_SVC := web
DB_SVC  := postgres_db_anteraja
NETWORK := backend-net

# Dipakai oleh health & bench (bisa di-override: make bench NIK=xxx PASS=yyy)
APP_URL ?= http://127.0.0.1:8000
NIK     ?= ADM-102
PASS    ?= password123

# Produksi: tanpa package dev. Untuk dev: make up COMPOSER_FLAGS="--optimize-autoloader --no-interaction"
COMPOSER_FLAGS ?= --no-dev --optimize-autoloader --no-interaction

# Perintah di dalam container
ARTISAN := $(COMPOSE) exec -T $(APP_SVC) php artisan
ROOT    := $(COMPOSE) exec -T -u root -e COMPOSER_ALLOW_SUPERUSER=1 $(APP_SVC)

.PHONY: help network env build start install key perms migrate seed optimize clear \
        up setup down stop destroy restart reload update fresh \
        health bench ps logs logs-app logs-web laravel-log shell tinker

help: ## Tampilkan daftar perintah
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-14s\033[0m %s\n",$$1,$$2}'

# ----------------------------------------------------------------------------
#  Langkah-langkah kecil (dipanggil oleh up / update)
# ----------------------------------------------------------------------------
network: ## Buat network backend-net kalau belum ada
	@docker network inspect $(NETWORK) >/dev/null 2>&1 || { echo "-> membuat network $(NETWORK)"; docker network create $(NETWORK); }

env: ## Salin .env.example ke .env kalau .env belum ada
	@test -f .env || { echo "-> .env belum ada, menyalin dari .env.example"; cp .env.example .env; }

build: ## Build image PHP (pakai cache)
	$(COMPOSE) build $(APP_SVC)

start:
	$(COMPOSE) up -d --no-deps --wait $(DB_SVC)
	$(COMPOSE) up -d --no-deps $(APP_SVC) $(WEB_SVC)

install: ## composer install di dalam container
	@$(ROOT) git config --global --add safe.directory /var/www/html || true
	$(ROOT) composer install $(COMPOSER_FLAGS)

key: ## Buat APP_KEY dan JWT_SECRET hanya kalau masih kosong
	@$(ROOT) sh -c "grep -q '^APP_KEY=.\+' .env || php artisan key:generate --force"
	@$(ROOT) sh -c "grep -q '^JWT_SECRET=.\+' .env || php artisan jwt:secret --force"

perms: ## Perbaiki izin storage dan bootstrap/cache untuk www-data
	@$(ROOT) sh -c "mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache && chmod -R 775 storage bootstrap/cache"

migrate: ## Jalankan migrasi database
	$(ARTISAN) migrate --force

seed: ## Jalankan seeder (hanya kalau diminta)
	$(ARTISAN) db:seed --force

optimize: ## Bersihkan lalu buat ulang cache config/route/view
	$(ARTISAN) optimize:clear
	$(ARTISAN) optimize

clear: ## Hapus semua cache Laravel (pakai setelah ubah .env)
	$(ARTISAN) optimize:clear

# ----------------------------------------------------------------------------
#  Perintah utama
# ----------------------------------------------------------------------------
up: network env build start install key perms migrate optimize health ## Jalankan semuanya (aman dipanggil berulang)
	@echo "Selesai. Stack berjalan di $(APP_URL)"

setup: up seed ## Pertama kali saja: up + seed data awal

down: ## Matikan container (data database TETAP aman)
	$(COMPOSE) down

stop: ## Hentikan container tanpa menghapusnya
	$(COMPOSE) stop

destroy: ## Matikan dan HAPUS volume database (minta konfirmasi)
	@read -p "Ini menghapus SEMUA data database. Ketik 'yes' untuk lanjut: " ans; [ "$$ans" = "yes" ] || { echo "Dibatalkan."; exit 1; }
	$(COMPOSE) down -v

reload: ## Restart php-fpm lalu nginx (kosongkan OPcache, segarkan IP upstream)
	$(COMPOSE) restart $(APP_SVC)
	$(COMPOSE) restart $(WEB_SVC)

restart: reload health ## Alias reload + cek kesehatan

update: ## git pull, lalu up, reload, health (deploy versi baru)
	git pull --ff-only
	$(MAKE) up
	$(MAKE) reload
	$(MAKE) health

fresh: ## Reset database dari nol + seed (minta konfirmasi)
	@read -p "Ini menghapus SEMUA tabel dan datanya. Ketik 'yes' untuk lanjut: " ans; [ "$$ans" = "yes" ] || { echo "Dibatalkan."; exit 1; }
	$(ARTISAN) migrate:fresh --seed --force

# ----------------------------------------------------------------------------
#  Pengecekan & debugging
# ----------------------------------------------------------------------------
health: ## Cek apakah nginx -> php-fpm -> laravel sehat
	@for i in 1 2 3 4 5 6 7 8 9 10; do \
	  code=$$(curl -s -o /dev/null -w '%{http_code}' -X POST $(APP_URL)/api/v1/auth/login -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{}'); \
	  if [ "$$code" != "000" ] && [ "$$code" != "502" ] && [ "$$code" != "504" ]; then break; fi; \
	  sleep 2; \
	done; \
	case "$$code" in \
	  200|401|422) echo "SEHAT (HTTP $$code): nginx, php-fpm, dan laravel merespons.";; \
	  500) echo "GAGAL (HTTP 500): error di Laravel. Jalankan: make laravel-log"; exit 1;; \
	  502|504) echo "GAGAL (HTTP $$code): nginx tidak bisa ke php-fpm. Jalankan: make logs-web"; exit 1;; \
	  000) echo "GAGAL: tidak ada respons dari $(APP_URL). Cek: make ps"; exit 1;; \
	  *) echo "HTTP $$code (tidak dikenali)"; exit 1;; \
	esac

bench: ## Ukur waktu login 5x (cold vs warm)
	@for i in 1 2 3 4 5; do \
	  curl -s -o /dev/null -X POST $(APP_URL)/api/v1/auth/login \
	    -H 'Content-Type: application/json' -H 'Accept: application/json' \
	    -d '{"nik":"$(NIK)","password":"$(PASS)"}' \
	    -w "#$$i  status=%{http_code}  connect=%{time_connect}s  ttfb=%{time_starttransfer}s  total=%{time_total}s\n"; \
	done

ps: ## Status container
	$(COMPOSE) ps -a

logs: ## Log semua service (live)
	$(COMPOSE) logs -f --tail=100

logs-app: ## Log php-fpm (live)
	$(COMPOSE) logs -f --tail=100 $(APP_SVC)

logs-web: ## Log nginx (live)
	$(COMPOSE) logs -f --tail=100 $(WEB_SVC)

laravel-log: ## 60 baris terakhir storage/logs/laravel.log
	$(COMPOSE) exec -T $(APP_SVC) tail -n 60 storage/logs/laravel.log

shell: ## Masuk ke shell container app
	$(COMPOSE) exec $(APP_SVC) bash

tinker: ## Buka artisan tinker
	$(COMPOSE) exec $(APP_SVC) php artisan tinker
