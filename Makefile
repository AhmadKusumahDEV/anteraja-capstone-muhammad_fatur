.PHONY: help install update dump autoload serve start optimize optimize-clear clear clear-cache migrate migrate-fresh seed test storage-link setup make-model make-controller make-migration make-seeder make-request make-middleware make-component make-mail make-job

help:
	@echo "Available commands:"
	@echo "  make setup          - Initial project setup (install, env, key, migrate, seed)"
	@echo "  make install        - Install composer dependencies"
	@echo "  make update         - Update composer dependencies"
	@echo "  make dump           - Run composer dump-autoload"
	@echo "  make serve          - Start the Laravel development server"
	@echo "  make optimize       - Cache config, routes, and views for production"
	@echo "  make optimize-clear - Clear all caches"
	@echo "  make migrate        - Run database migrations"
	@echo "  make migrate-fresh  - Drop all tables and re-run migrations"
	@echo "  make seed           - Seed the database"
	@echo "  make test           - Run PHPUnit tests"
	@echo "  make storage-link   - Create storage symbolic link"
	@echo ""
	@echo "Generator Commands (Interactive or pass 'name=NamaFile'):"
	@echo "  make make-model     - Create a new Eloquent model"
	@echo "  make make-controller- Create a new controller class"
	@echo "  make make-migration - Create a new migration file"
	@echo "  make make-seeder    - Create a new seeder class"
	@echo "  make make-request   - Create a new form request class"
	@echo "  make make-middleware- Create a new middleware class"
	@echo "  make make-component - Create a new view component"
	@echo "  make make-mail      - Create a new email class"
	@echo "  make make-job       - Create a new job class"

# --- Composer Commands ---

install:
	composer install

update:
	composer update

dump: autoload
autoload:
	composer dump-autoload

# --- Artisan Commands ---

serve: start
start:
	php artisan serve

optimize:
	php artisan optimize

clear: optimize-clear
optimize-clear: clear-cache
clear-cache:
	php artisan optimize:clear

migrate:
	php artisan migrate

migrate-fresh:
	php artisan migrate:fresh

seed:
	php artisan db:seed

test:
	php artisan test

storage-link:
	php artisan storage:link

# --- Generator Commands ---

make-model:
	php artisan make:model $(name)

make-controller:
	php artisan make:controller $(name)

make-migration:
	php artisan make:migration $(name)

make-seeder:
	php artisan make:seeder $(name)

make-request:
	php artisan make:request $(name)

make-middleware:
	php artisan make:middleware $(name)

make-component:
	php artisan make:component $(name)

make-mail:
	php artisan make:mail $(name)

make-job:
	php artisan make:job $(name)

# --- Setup Commands ---

setup:
	composer install
	php -r "file_exists('.env') || copy('.env.example', '.env');"
	php artisan key:generate
	php artisan migrate:fresh --seed
	php artisan storage:link
