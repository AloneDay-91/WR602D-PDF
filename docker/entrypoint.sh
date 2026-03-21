#!/bin/bash
set -e

echo "==> Attente de PostgreSQL..."
wait-for-it "${DB_HOST:-db}:${DB_PORT:-5432}" --timeout=60 --strict -- echo "PostgreSQL disponible"

echo "==> Migrations Doctrine..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "==> Installation des assets Symfony..."
php bin/console assets:install public --no-interaction

echo "==> Réchauffement du cache..."
php bin/console cache:warmup --no-interaction

echo "==> Création des répertoires de stockage..."
mkdir -p var/pdf_storage var/queue_storage
chown -R www-data:www-data var/

echo "==> Démarrage Apache..."
exec apache2-foreground