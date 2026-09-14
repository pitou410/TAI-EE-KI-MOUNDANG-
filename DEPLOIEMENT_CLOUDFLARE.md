# Mise en ligne TAI EE KI Moundang — Cloudflare Workers + D1

## Architecture retenue
- Domaine : `tai-ee-ki-moundang.org` et `www.tai-ee-ki-moundang.org`
- Hébergement : Cloudflare Workers Static Assets
- API : Cloudflare Worker
- Base : Cloudflare D1
- HTTPS : fourni par Cloudflare
- Administration : `/admin`
- Numéro officiel initial : `+237 675 19 82 09`

## Étape 0 — Tester pour le client
1. Présenter le fichier autonome d’aperçu au client avant validation.
2. Présenter séparément le fonctionnement de l’espace d’administration.
3. Ne pas envoyer les secrets Cloudflare.

## Étape 1 — Créer le compte Cloudflare
1. Aller sur `https://dash.cloudflare.com/`.
2. Créer le compte de l'association ou utiliser une adresse contrôlée par l'association.
3. Activer l'authentification à deux facteurs.

## Étape 2 — Créer la base D1
Dans Cloudflare : Workers & Pages > D1 SQL Database > Create database.

Nom conseillé : `tai-ee-ki-moundang-db`.

Pour les données de membres, choisir si possible la juridiction UE si cela correspond à la politique de l'association. La juridiction se choisit à la création et ne se modifie pas ensuite.

Ouvrir ensuite la console SQL D1 et exécuter le contenu de :
`migrations/0001_initial.sql`

## Étape 3 — Mettre le projet sur GitHub
Créer un dépôt privé nommé par exemple `tai-ee-ki-moundang` puis importer tout le contenu de ce dossier en conservant les dossiers :
- `public/`
- `src/`
- `migrations/`
- `wrangler.jsonc`
- `package.json`

Ne jamais publier un fichier contenant un mot de passe ou une clé secrète.

## Étape 4 — Créer le Worker
Cloudflare > Workers & Pages > Create application > Import a repository.
Choisir le dépôt GitHub.
Le projet utilise `src/index.js` comme Worker et `public/` comme assets statiques.

## Étape 5 — Ajouter la base D1 au Worker
Dans le Worker : Settings/Bindings (ou Bindings selon l'interface) > Add binding > D1 database.
- Variable name : `DB`
- Database : `tai-ee-ki-moundang-db`

Le code utilise ensuite `env.DB`.

## Étape 6 — Ajouter les secrets
Dans le Worker, Variables and Secrets :
- `ADMIN_PASSWORD` : mot de passe initial choisi par l'association (minimum 10 caractères)
- `SESSION_SECRET` : une longue valeur aléatoire, différente du mot de passe

Ne pas mettre ces valeurs dans GitHub.

Après la première connexion, changer le mot de passe depuis Administration > Sécurité.

## Étape 7 — Tester
Ouvrir l'adresse `*.workers.dev` fournie par Cloudflare.
Tester :
- accueil
- inscription
- événements
- réunions
- bureau
- galerie
- `/admin`
- connexion
- modification d'un texte
- modification du téléphone/WhatsApp
- changement du logo
- ajout/suppression d'un événement
- inscription membre

## Étape 8 — Domaine
Dans le Worker > Domains, ajouter :
- `tai-ee-ki-moundang.org`
- `www.tai-ee-ki-moundang.org`

Si le domaine est acheté chez Cloudflare Registrar, le raccordement est simplifié. Si le domaine est acheté ailleurs, suivre les instructions DNS/Nameservers données par Cloudflare.

## Étape 9 — Test final
Tester l'adresse publique puis `/admin` depuis un autre téléphone. Vérifier que les modifications administratives apparaissent sur le site public.

## Important sur le gratuit
Cloudflare Workers Free et D1 Free conviennent à un petit site associatif tant que les limites gratuites ne sont pas dépassées. D1 Free inclut actuellement 5 millions de lignes lues/jour, 100 000 lignes écrites/jour et 5 Go de stockage total. Depuis le 1er septembre 2026, les limites quotidiennes D1 gratuites sont effectivement appliquées : si elles sont dépassées, les requêtes échouent jusqu'au reset quotidien. Pour TAI EE KI, la consommation normale attendue est très inférieure à ces limites, mais elle doit être surveillée.
