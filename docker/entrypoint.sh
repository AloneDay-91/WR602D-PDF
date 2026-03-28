#!/bin/bash
set -e

# Extraire host:port depuis DATABASE_URL si DB_HOST/DB_PORT ne sont pas définis
if [ -z "${DB_HOST:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
    DB_HOSTPORT=$(echo "$DATABASE_URL" | sed 's|.*@||' | cut -d'/' -f1)
    DB_HOST=$(echo "$DB_HOSTPORT" | cut -d':' -f1)
    DB_PORT=$(echo "$DB_HOSTPORT" | cut -d':' -f2)
fi

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"

echo "==> Attente de la base de données ($DB_HOST:$DB_PORT)..."
wait-for-it "${DB_HOST}:${DB_PORT}" --timeout=60 --strict -- echo "Base de données disponible"

echo "==> Migrations Doctrine..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

if [ "${LOAD_FIXTURES:-false}" = "true" ]; then
    echo "==> Chargement des fixtures..."
    php bin/console doctrine:fixtures:load --no-interaction --append
fi

echo "==> Installation des assets Symfony..."
php bin/console assets:install public --no-interaction

echo "==> Réchauffement du cache..."
php bin/console cache:warmup --no-interaction

echo "==> Création des répertoires de stockage..."
mkdir -p var/pdf_storage var/queue_storage
chown -R www-data:www-data var/

echo "==> Démarrage Apache..."
exec apache2-foreground
