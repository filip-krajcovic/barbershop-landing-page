# Britva Barber – landing page

Landing page + online rezervácie pre barbershop **Britva Barber** (Trnava).
Dizajn: artefakt _Britva Barber – landing page_.

> Stav: rozpracované, postup je v [issues](https://github.com/filip-krajcovic/barbershop-landing-page/issues).

## Stack

| Vrstva         | Technológia                              |
| -------------- | ---------------------------------------- |
| Frontend       | Nuxt 3 (Vue 3) + Tailwind CSS            |
| Backend        | NestJS (REST API pre rezervácie)         |
| Autentifikácia | better-auth                              |
| Databáza       | PostgreSQL + Drizzle ORM                 |
| Migrácie       | drizzle-kit, SQL súbory verzované v gite |
| Monorepo       | pnpm workspaces                          |

## Štruktúra

```
apps/
  web/                 Nuxt aplikácia (app/: stránky, komponenty, composables)
  api/                 NestJS API
    src/auth/          better-auth + guardy
    src/database/      Drizzle schéma, klient, seed
    src/bookings/      rezervácie
    src/availability/  výpočet voľných termínov
    src/services/      cenník
    src/barbers/       barberi
    src/notifications/ SMS potvrdenia a pripomienky
    drizzle/           SQL migrácie (commitujú sa)
packages/
  shared/              zdieľané typy a zod schémy
docs/                  architektúra, dizajn, databáza
```

## Lokálne spustenie

Požiadavky: Node.js 22+, pnpm 10, Docker.

```bash
pnpm install
cp .env.example .env            # premenné pre docker compose
cp apps/api/.env.example apps/api/.env  # premenné API (DATABASE_URL, better-auth)
cp apps/web/.env.example apps/web/.env  # URL API pre web
pnpm db:up                      # PostgreSQL 16 na localhost:5432
pnpm db:migrate && pnpm db:seed # schéma a ukážkové dáta
pnpm dev                        # web http://localhost:3000, API http://localhost:3001
```

## Nasadenie

Web na Cloudflare Pages, API a databáza na vlastnom PC cez Cloudflare Tunnel: [docs/DEPLOY.md](docs/DEPLOY.md).

## Skripty

| Príkaz                                        | Popis                                |
| --------------------------------------------- | ------------------------------------ |
| `pnpm dev`                                    | spustí všetky aplikácie v dev režime |
| `pnpm build`                                  | build všetkých balíkov               |
| `pnpm lint` / `pnpm typecheck` / `pnpm test`  | kontroly naprieč monorepom           |
| `pnpm format` / `pnpm format:check`           | Prettier                             |
| `pnpm db:up` / `pnpm db:down`                 | lokálna databáza v Dockeri           |
| `pnpm db:generate` / `db:migrate` / `db:seed` | Drizzle migrácie a seed              |

## Migrácie

Zmena schémy v `apps/api/src/database/schema/` → `pnpm db:generate` → skontrolovať SQL v `apps/api/drizzle/` → commit → `pnpm db:migrate`.
