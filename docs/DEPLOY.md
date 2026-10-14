# Nasadenie: web na Cloudflare Pages, API a databáza na vlastnom PC

```
Návštevník ──► Cloudflare Pages (Nuxt, /api/** proxy) ──Cloudflare Tunnel──► PC: API :3001 ──► PostgreSQL (Docker)
```

Prehliadač volá iba doménu webu. Server webu na Cloudflare preposiela `/api/**` cez tunel na API na tvojom PC a pridá tajný kľúč (`PROXY_SECRET`). API bez kľúča odmietne všetko okrem `/api/health`, takže adresu tunela nemusíš tajiť.

> PC musí bežať a byť pripojené na internet. Keď sa uspí alebo vypne, cenník, termíny, rezervácie a prihlásenie nefungujú (zvyšok stránky áno).

## 1. Tajný kľúč

Vygeneruj ho raz a použi na oboch stranách:

```bash
openssl rand -base64 32
```

## 2. API a databáza na PC

`apps/api/.env` (adresu webu doplníš po prvom nasadení na Pages, krok 4):

```
NODE_ENV=production
PORT=3001
WEB_URL=https://<projekt>.pages.dev
BETTER_AUTH_URL=https://<projekt>.pages.dev
DATABASE_URL=postgres://britva:britva@localhost:5432/britva
BETTER_AUTH_SECRET=<iný náhodný kľúč, openssl rand -base64 32>
PROXY_SECRET=<kľúč z kroku 1>
BOOKING_RATE_LIMIT=10
```

`WEB_URL` aj `BETTER_AUTH_URL` sú adresa **webu**, nie tunela. Prihlásenie ide cez web.

Spustenie (databáza v Dockeri, API v produkčnom režime):

```bash
pnpm install
pnpm db:up
pnpm db:migrate
pnpm db:seed --force  # iba prvýkrát – ukážkové služby a barberi (v produkcii vyžaduje --force)
pnpm --filter @britva/api build
pnpm --filter @britva/api start
```

Po zmene kódu (`git pull`) zopakuj `pnpm install`, `pnpm db:migrate`, `build` a `start`.

## 3. Cloudflare Tunnel

Inštalácia na macOS: `brew install cloudflared`.

### Bez vlastnej domény (rýchly tunel)

```bash
cloudflared tunnel --url http://localhost:3001
```

Vypíše adresu `https://<nahodne-slova>.trycloudflare.com`. **Pri každom spustení je iná**, preto ju vždy treba prepísať v `NUXT_API_PROXY_URL` na Pages a nasadiť znova (krok 4). Vhodné na skúšanie.

### S vlastnou doménou v Cloudflare (stála adresa)

```bash
cloudflared tunnel login
cloudflared tunnel create britva-api
cloudflared tunnel route dns britva-api api.tvoja-domena.sk
cloudflared tunnel run --url http://localhost:3001 britva-api
```

Adresa `https://api.tvoja-domena.sk` ostane rovnaká aj po reštarte.

## 4. Cloudflare Pages

Workers & Pages → Create → Pages → Connect to Git → repozitár.

| Pole                   | Hodnota                                                      |
| ---------------------- | ------------------------------------------------------------ |
| Production branch      | `claude/clever-mayer-ykclah`                                 |
| Framework preset       | `None`                                                       |
| Build command          | `pnpm --filter @britva/web build`                            |
| Build output directory | `apps/web/dist`                                              |
| Root directory         | prázdne (koreň repozitára – web potrebuje `packages/shared`) |

Environment variables (Production, prípadne aj Preview):

| Premenná                | Hodnota                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `NODE_VERSION`          | `22`                                                          |
| `PNPM_VERSION`          | `10.28.0`                                                     |
| `NUXT_API_PROXY_URL`    | adresa tunela bez `/api`, napr. `https://api.tvoja-domena.sk` |
| `NUXT_API_PROXY_SECRET` | kľúč z kroku 1 (typ **Secret**)                               |
| `NUXT_PUBLIC_SITE_URL`  | adresa webu, napr. `https://<projekt>.pages.dev`              |

Zmena premennej sa prejaví až v novom nasadení (Deployments → … → Retry deployment, alebo nový push).

Po prvom nasadení doplň adresu webu do `WEB_URL` a `BETTER_AUTH_URL` v `apps/api/.env` a reštartuj API.

## 5. Overenie

| Adresa                                     | Očakávané                             |
| ------------------------------------------ | ------------------------------------- |
| `https://<tunel>/api/health`               | `{"status":"ok","database":"ok"}`     |
| `https://<tunel>/api/services`             | 403 – bez kľúča sa na API nedá dostať |
| `https://<projekt>.pages.dev/api/services` | zoznam služieb (web posiela kľúč)     |

Na webe: cenník sa načíta, prejde rezervácia, registrácia a po obnovení stránky ostaneš prihlásený.

Ak cenník ukazuje „Cenník sa teraz nepodarilo načítať“: beží API (`/api/health` cez tunel)? Sedí `NUXT_API_PROXY_URL` s aktuálnou adresou tunela a je nasadené nové nasadenie? Je `NUXT_API_PROXY_SECRET` rovnaký ako `PROXY_SECRET`?

## Prevádzka

- **Uspávanie:** na Macu drž PC hore napr. `caffeinate -s` (kým beží, napájaný Mac sa neuspí).
- **Zálohy databázy:** `docker compose exec -T postgres pg_dump -U britva britva > zaloha-$(date +%F).sql`
- **Admin:** zaregistruj sa na webe a potom `pnpm --filter @britva/api auth:make-admin <email>`.
- **SMS** sa zatiaľ neposielajú, iba sa vypíšu do logu API.
