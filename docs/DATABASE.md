# Databáza

PostgreSQL 16 + [Drizzle ORM](https://orm.drizzle.team). Schéma je v `apps/api/src/database/schema/`, migrácie v `apps/api/drizzle/`.

## Dátový model

| Tabuľka           | Obsah                                                                            |
| ----------------- | -------------------------------------------------------------------------------- |
| `services`        | cenník – názov, popis, trvanie (min), cena v centoch, poradie, aktívna           |
| `barbers`         | barberi – meno, špecializácia, avatar, poradie, aktívny                          |
| `barber_services` | ktoré služby robí ktorý barber (M:N)                                             |
| `working_hours`   | otváracie hodiny barbera pre deň v týždni (0 = nedeľa … 6 = sobota), miestny čas |
| `time_off`        | výnimky – dovolenka, sviatok (interval `timestamptz`)                            |
| `bookings`        | rezervácie – služba, barber, začiatok/koniec, kontakt, stav, voliteľne `user_id` |

Konvencie:

- primárne kľúče sú UUID (`gen_random_uuid()`),
- názvy stĺpcov sú `snake_case` (Drizzle `casing: 'snake_case'`, v TS `camelCase`),
- časy sú `timestamptz`, ceny v centoch (`integer`).

### Obmedzenia v databáze

- `bookings_no_overlap`: jeden barber nemôže mať dve aktívne (`pending`, `confirmed`) rezervácie s prekrývajúcim sa časom. Ide o exclusion constraint nad `tstzrange(starts_at, ends_at, '[)')` (rozšírenie `btree_gist`), definovaný vo vlastnej migrácii `0001_bookings_no_overlap.sql`. Vďaka nemu súbežné rezervácie toho istého termínu nemôžu prejsť ani pri race condition v aplikácii (chyba `23P01`).
- `CHECK` obmedzenia: koniec po začiatku, kladné trvanie, nezáporná cena, `weekday` 0–6.

## Workflow migrácií

1. Uprav schému v `apps/api/src/database/schema/`.
2. `pnpm db:generate`: drizzle-kit vygeneruje SQL do `apps/api/drizzle/`.
3. Skontroluj vygenerované SQL (premenovania stĺpcov, dátové migrácie).
4. Commitni schému aj migráciu v jednom commite.
5. `pnpm db:migrate` aplikuje migrácie.

Pravidlá:

- Migrácie sa po merge **nikdy needitujú**. Oprava = nová migrácia.
- Čo Drizzle nevie vyjadriť (exclusion constraint, triggery, dátové migrácie), patrí do vlastnej migrácie: `pnpm --filter @britva/api exec drizzle-kit generate --custom --name <nazov>`.
- CI kontroluje, že `drizzle-kit check` prejde a že `db:generate` nevytvorí žiadny nový súbor, teda že schéma a commitnuté migrácie sú zosúladené.

## Lokálne

```bash
pnpm db:up        # PostgreSQL v Dockeri
pnpm db:migrate   # aplikuje migrácie (DATABASE_URL z apps/api/.env)
pnpm db:seed      # ukážkové dáta – idempotentné, dá sa spustiť opakovane
pnpm --filter @britva/api db:studio   # Drizzle Studio
```

Testy API (`pnpm test`) potrebujú databázu s aplikovanými migráciami. Predvolene `postgres://britva:britva@localhost:5432/britva_test`, dá sa prepísať cez `DATABASE_URL`.
