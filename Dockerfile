# ─── Stage 1 : build des assets front ───────────────────────────────────────
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY webpack.config.js postcss.config.mjs ./
COPY assets/ assets/

RUN npm run build

# ─── Stage 2 : image finale PHP 8.3 Apache ───────────────────────────────────
FROM php:8.3-apache

# Dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev \
        libzip-dev \
        libicu-dev \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        unzip \
        git \
        wait-for-it \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo \
        pdo_pgsql \
        pgsql \
        intl \
        zip \
        gd \
        opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Apache : activer mod_rewrite + config vhost
RUN a2enmod rewrite
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Code source
WORKDIR /var/www/html

COPY . .

# Assets compilés depuis le stage frontend
COPY --from=frontend /app/public/build public/build/

# Dépendances PHP (production)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Répertoires runtime nécessaires
RUN mkdir -p var/pdf_storage var/queue_storage var/log var/cache \
    && chown -R www-data:www-data var/ \
    && chmod -R 775 var/

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]