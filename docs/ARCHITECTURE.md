# Architektúra

```
Prehliadač ──► apps/web (Nuxt) ──fetch, credentials: include──► apps/api (NestJS, /api/*) ──► PostgreSQL
```

- **`apps/web`**: Nuxt + Tailwind, landing page a rezervačný dialóg.
- **`apps/api`**: NestJS 12 (ESM), REST API pod prefixom `/api`.
- **`packages/shared`**: zod schémy a typy zdieľané medzi webom a API.
- **Databáza**: PostgreSQL 16 + Drizzle ORM, pozri [DATABASE.md](./DATABASE.md).

## Autentifikácia (better-auth)

- better-auth beží v API, jeho handler je namontovaný na Express pre `/api/auth/*` (registrácia, prihlásenie, odhlásenie, session).
- NestJS má globálny body parser **vypnutý** (`APP_OPTIONS`) a zapína ho až `setupApp` po handleri better-auth. better-auth číta telo requestu sám, s už sparsovaným telom by request zamrzol. Poradie middlewarov je CORS → better-auth → JSON parser → Nest routy.
- Session je v HTTP-only cookie. Web volá API s `credentials: 'include'` a API povoľuje CORS iba pre `WEB_URL`, ktorý je zároveň v `trustedOrigins` better-auth (ochrana proti CSRF).
- Používateľ má rolu `customer` (predvolená) alebo `admin`. Rolu nemožno nastaviť pri registrácii (`input: false`). Admina vytvoríš príkazom `pnpm --filter @britva/api auth:make-admin <email>`.
- Ochrana endpointov v NestJS cez dekorátor `@Auth()`:
  - `@Auth()`: iba prihlásený (inak 401)
  - `@Auth({ roles: ['admin'] })`: iba admin (inak 403)
  - `@Auth({ optional: true })`: verejné, prihlásenému sa doplní používateľ
  - prihláseného používateľa sprístupní `@CurrentUser()`
- `GET /api/me` vracia prihláseného používateľa (`meSchema` z `@britva/shared`).
