# syntax=docker/dockerfile:1

# ---------- Stage 1: vendor ----------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist \
    --no-interaction --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts --ignore-platform-reqs

# ---------- Stage 2: base ----------
FROM php:8.3-fpm AS base

# Install ekstensi PHP (termasuk Redis)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev libonig-dev libxml2-dev libpq-dev libfcgi-bin \
    && docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd opcache \
    && pecl install redis && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/10-opcache.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/zz-app.conf
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html
ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]

# ---------- Stage 3: dev ----------
FROM base AS dev
ARG HOST_UID=1000
ARG HOST_GID=1000
# Install git dan unzip (khusus lokal/dev) serta sinkronisasi UID
RUN apt-get update && apt-get install -y --no-install-recommends git unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \
    && groupmod -o -g ${HOST_GID} www-data || true \
    && usermod -o -u ${HOST_UID} -g ${HOST_GID} www-data || true \
    && cp "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_HOME=/tmp/composer
RUN echo "opcache.validate_timestamps=1" > /usr/local/etc/php/conf.d/zz-opcache-dev.ini

# ---------- Stage 4: prod (default) ----------
FROM base AS prod
COPY --from=vendor --chown=www-data:www-data /app /var/www/html
RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && echo "opcache.validate_timestamps=0" > /usr/local/etc/php/conf.d/zz-opcache-prod.ini \
    && mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions \
    storage/framework/views storage/app/public bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache
ENV APP_ENV=production
