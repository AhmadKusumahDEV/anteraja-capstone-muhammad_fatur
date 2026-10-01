FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (including pdo_pgsql for PostgreSQL)
RUN docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
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
