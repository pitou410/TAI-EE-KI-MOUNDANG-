# TAI EE KI Moundang — version Cloudflare + D1

Version destinée à une mise en ligne économique et administrable.

## Ce que contient le projet

- `public/index.html` : site public réel
- `public/admin.html` : espace administrateur réel
- `src/index.js` : API + sécurité + logique Cloudflare Worker
- `migrations/0001_initial.sql` : base Cloudflare D1
- `wrangler.jsonc` : configuration Cloudflare Workers Static Assets
- `DEPLOIEMENT_CLOUDFLARE.md` : procédure complète de mise en ligne
- `CLIENT_README.md` : guide simple pour montrer le résultat au client

## Fonctionnement final

Le client/administrateur se connecte à `/admin` et peut modifier les textes, le numéro officiel, WhatsApp, le logo, les événements, les réunions, le bureau, la galerie et les demandes d'inscription sans modifier le code.

Le site public lit les données depuis D1. Une modification enregistrée dans l'administration est donc récupérée automatiquement par le site public.

## Sécurité

Le mot de passe initial doit être créé comme secret Cloudflare `ADMIN_PASSWORD`. Le code ne contient volontairement pas le mot de passe. Utiliser `TAI@Admin2026!` uniquement comme mot de passe initial si l'association le décide, puis le changer immédiatement depuis Administration > Sécurité.

Un second secret `SESSION_SECRET` doit être défini avec une longue valeur aléatoire.

## Coût visé

- Cloudflare Workers Free : 0 FCFA/mois dans les limites gratuites.
- D1 Free : 0 FCFA/mois dans les limites gratuites.
- HTTPS/SSL : inclus.
- Domaine : seul coût régulier principal. Cloudflare Registrar vend les domaines à prix coûtant, sans majoration ; le prix exact du `.org` doit être vérifié au moment de l'achat.

Pour un petit site associatif, cette architecture est donc conçue pour viser **le coût d'hébergement mensuel de 0 FCFA** au départ, avec surveillance de la consommation.
