# ZenPDF

Application web de conversion et manipulation de fichiers PDF, construite avec Symfony 7.4 et React.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | PHP 8.3 · Symfony 7.4 |
| Frontend | React 18 · Tailwind CSS 4 · shadcn/ui |
| Bundler | Webpack Encore |
| Base de données | MySQL / MariaDB 10.8 |
| Conversion PDF | Gotenberg 8 |
| Paiements | Stripe |
| Emails | Symfony Mailer (SMTP) |
| Conteneurisation | Docker (multi-stage build) |

## Fonctionnalités

### Outils de conversion

| Outil | Plan requis |
|-------|-------------|
| URL vers PDF | FREE |
| HTML vers PDF | BASIC |
| Word vers PDF (.doc, .docx) | BASIC |
| Excel vers PDF (.xls, .xlsx) | BASIC |
| PowerPoint vers PDF (.ppt, .pptx) | BASIC |
| Image vers PDF (.jpg, .png, .tiff…) | BASIC |
| Markdown vers PDF | BASIC |
| Capture d'écran (PNG) | BASIC |
| Éditeur WYSIWYG → PDF | BASIC |
| Fusionner des PDFs | PREMIUM |
| Découper un PDF | PREMIUM |
| Convertir en PDF/A | PREMIUM |
| Protéger un PDF (chiffrement) | PREMIUM |

### Abonnements

| Plan | Prix | Quota |
|------|------|-------|
| FREE | Gratuit | 2 générations / jour |
| BASIC | 9,99 € / mois | 20 générations / jour |
| PREMIUM | 45 € / mois | Illimité |

> Les plans BASIC et PREMIUM supportent la facturation annuelle (−20 %) via Stripe.

### Autres fonctionnalités

- Authentification (inscription, connexion, réinitialisation de mot de passe, vérification email)
- Historique des générations avec téléchargement et export ZIP
- Carnet de contacts et partage de documents par email
- Portail de facturation Stripe (gestion des abonnements, factures)
- Personnalisation de la couleur d'accentuation de l'interface
- File d'attente asynchrone pour la fusion de PDFs

## Installation locale

### Prérequis

- Docker & Docker Compose
- PHP 8.3 + Composer
- Node.js 20 + npm

### Démarrage rapide

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd WR602D-PDF

# 2. Démarrer les services Docker (DB, Gotenberg, Maildev)
docker-compose up -d

# 3. Installer les dépendances PHP
composer install

# 4. Installer les dépendances JS et compiler les assets
npm ci && npm run build

# 5. Configurer l'environnement
cp .env .env.local
# Éditer .env.local avec vos valeurs (DATABASE_URL, STRIPE_SECRET_KEY, etc.)

# 6. Créer la base de données et exécuter les migrations
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# 7. Charger les données de base (plans, outils)
php bin/console doctrine:fixtures:load --append

# 8. Lancer le serveur de développement
symfony server:start
```

L'application est accessible sur `http://localhost:8000`.
Maildev (emails de développement) est accessible sur `http://localhost:1080`.

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion à la base de données | `mysql://user:pass@127.0.0.1:3306/zenpdf` |
| `APP_SECRET` | Clé secrète Symfony | chaîne aléatoire 32 caractères |
| `MAILER_DSN` | DSN du serveur mail | `smtp://maildev:1025` |
| `MAILER_FROM` | Adresse d'expédition des emails | `noreply@zenpdf.fr` |
| `API_URL_GOTENBERG` | URL de l'instance Gotenberg | `http://gotenberg:3000` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe | `whsec_...` |
| `DEFAULT_URI` | URI de base (pour les commandes CLI) | `https://zenpdf.fr` |
| `LOAD_FIXTURES` | Charger les fixtures au démarrage Docker | `true` / `false` |

## Déploiement (Docker)

Le projet utilise un **build multi-stage** :

1. **`composer-deps`** — installe les dépendances PHP (production)
2. **`frontend`** — compile les assets React/Tailwind via Webpack Encore
3. **`final`** — image PHP 8.3 Apache avec le code source, les assets et les dépendances

```bash
docker build -t zenpdf .
docker run -p 80:80 --env-file .env.prod zenpdf
```

L'entrypoint automatise au démarrage :
- attente de la base de données (`wait-for-it`)
- exécution des migrations Doctrine
- chargement des fixtures si `LOAD_FIXTURES=true`
- installation des assets Symfony
- préchauffage du cache

## CI/CD

Le pipeline GitHub Actions s'exécute sur les branches `develop` et `main` à chaque push ou pull request.

**Étapes :**
1. Installation PHP 8.3 + dépendances Composer
2. Build des assets Node.js
3. Exécution des tests PHPUnit (SQLite en mémoire)
4. Analyse statique PHP_CodeSniffer (PSR-2)
5. Analyse statique PHPStan (niveau 2)
6. Analyse statique PHPMD

## Tests

```bash
# Lancer tous les tests
php bin/phpunit

# Qualité de code
vendor/bin/phpcs --standard=PSR2 src/
vendor/bin/phpstan analyse src/ --level=2 --memory-limit=512M -c phpstan.neon
vendor/bin/phpmd src/ text cleancode,codesize,controversial,design
```

## Structure du projet

```
├── assets/
│   └── react/
│       ├── components/     # Composants réutilisables (Header, Footer, UI…)
│       └── controllers/    # Pages React (AccountPage, PricingPage…)
├── docker/
│   ├── apache.conf         # Configuration Apache
│   └── entrypoint.sh       # Script d'initialisation du conteneur
├── migrations/             # Migrations Doctrine
├── src/
│   ├── Command/            # Commandes CLI (file d'attente, notifications)
│   ├── Controller/         # Contrôleurs Symfony
│   ├── Entity/             # Entités Doctrine
│   ├── Event/              # Événements applicatifs
│   ├── EventListener/      # Écouteurs d'événements
│   ├── Repository/         # Repositories Doctrine
│   ├── Security/Voter/     # Voters de contrôle d'accès
│   ├── Service/            # Services (Stripe)
│   └── Services/           # Services (Gotenberg)
├── templates/              # Templates Twig
├── tests/                  # Tests PHPUnit
├── Dockerfile
└── docker-compose.yml
```

## Stripe — configuration

1. Créer les produits et prix dans le dashboard Stripe
2. Renseigner les IDs de prix dans la base de données :

```sql
-- Abonnements mensuels
UPDATE plan SET stripe_price_id = 'price_xxx' WHERE name = 'BASIC';
UPDATE plan SET stripe_price_id = 'price_xxx' WHERE name = 'PREMIUM';

-- Abonnements annuels (optionnel, −20 %)
UPDATE plan SET stripe_price_id_yearly = 'price_yyy' WHERE name = 'BASIC';
UPDATE plan SET stripe_price_id_yearly = 'price_yyy' WHERE name = 'PREMIUM';
```

3. Configurer le webhook Stripe vers `https://votre-domaine.fr/payment/webhook`
4. Renseigner `STRIPE_WEBHOOK_SECRET` dans les variables d'environnement