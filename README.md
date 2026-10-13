# Britva Barber – landing page

Landing page + online rezervácie pre barbershop **Britva Barber** (Trnava).
Dizajn: artefakt *Britva Barber – landing page*.

> Stav: **iba prázdna súborová štruktúra**. Každý súbor obsahuje komentár s popisom, čo v ňom bude.

## Stack

| Vrstva        | Technológia                                  |
| ------------- | -------------------------------------------- |
| Frontend      | Nuxt 3 (Vue 3) + Tailwind CSS                |
| Backend       | NestJS (REST API pre rezervácie)             |
| Autentifikácia| better-auth                                  |
| Databáza      | PostgreSQL + Drizzle ORM                     |
| Migrácie      | drizzle-kit, SQL súbory verzované v gite     |
| Monorepo      | pnpm workspaces                              |

## Štruktúra

```
apps/
  web/                 Nuxt aplikácia (stránky, komponenty, composables)
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

## Migrácie

Zmena schémy v `apps/api/src/database/schema/` → `pnpm db:generate` → skontrolovať SQL v `apps/api/drizzle/` → commit → `pnpm db:migrate`.
