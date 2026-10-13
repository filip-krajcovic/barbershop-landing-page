# Dizajn

Zdroj: artefakt **Britva Barber – landing page** (Claude Design, artboardy „Landing page“ 1440 px a „Mobil“ 390 px).

## Design tokeny

Definované v `apps/web/app/assets/css/main.css` cez Tailwind v4 `@theme`. Tailwind z nich generuje utility (`bg-canvas`, `text-ink-muted`, `border-line`, `font-display` …).

| Token                                                                 | Hodnota                                                   | Použitie                           |
| --------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------- |
| `canvas`                                                              | `#121110`                                                 | pozadie stránky                    |
| `surface`                                                             | `#1c1a17`                                                 | karty, panely                      |
| `surface-2`                                                           | `#1f1d1a`                                                 | vstupy, vnorené karty              |
| `raised`                                                              | `#1a1815`                                                 | pás sekcie Recenzie                |
| `line` / `line-soft` / `line-strong`                                  | `#2a2724` / `#34302b` / `#4a453e`                         | oddeľovače, okraje, ghost tlačidlo |
| `ink`                                                                 | `#ede7dd`                                                 | hlavný text                        |
| `ink-soft` / `ink-muted` / `ink-dim` / `ink-faint`                    | `#cfc7bb` / `#bdb4a7` / `#a39a8c` / `#8f877b`             | sekundárne texty                   |
| `accent`                                                              | `#d9a54c`                                                 | akcent, primárne tlačidlá, ikony   |
| `accent-hover`                                                        | `#f3d39a`                                                 | hover odkazov a tlačidiel          |
| `on-accent`                                                           | `#15130f`                                                 | text na akcentovom pozadí          |
| `paper` / `paper-ink` / `paper-muted` / `paper-line` / `paper-accent` | `#ede7dd` / `#191714` / `#4d4740` / `#cbc2b5` / `#7a5418` | svetlá sekcia Cenník               |

**Fonty** (npm `@fontsource-variable/*`, servírované z vlastnej domény):

- `font-display`: Big Shoulders Display (nadpisy, uppercase, 800–900)
- `font-sans`: Manrope (text, 400–700)

**Rozloženie**: obsah max. 1200 px (`.container-page`), bočné okraje 16 px na mobile a 24 px od `sm`. Zaoblenie kariet `rounded-card` (20 px), panelov `rounded-panel` (28 px), tlačidiel `rounded-full`.

## Komponenty (`apps/web/app/components`)

- `ui/BaseButton`: varianty `primary`, `ghost`, `link`; s `to` je to NuxtLink, s `href` odkaz (`newTab` pridá `target="_blank" rel="noopener"`), inak `<button>`. Min. výška 44 px.
- `ui/SectionEyebrow`: malý uppercase nadpis nad sekciou, voliteľne s čiarou.
- `ui/StarRating`: hviezdičky s `role="img"` a popisom „Hodnotenie 4,9 z 5“.
- `ui/IconInfoItem`: ikona + titulok + popis (kontakt, výhody).
- `ui/AppIcon`: inline SVG ikony (`currentColor`), dekoratívne (`aria-hidden`).
- `layout/AppHeader`, `layout/AppFooter`.

Komponenty sa registrujú bez prefixu priečinka (`<BaseButton>`, nie `<UiBaseButton>`).

## Pravidlá

- Prístupnosť: skutočné `<button>` a `<a>`, ciele aspoň 44 px, kontrast textu aspoň 4.5:1, dekoratívne SVG s `aria-hidden`, ikonové tlačidlá s `aria-label`.
- Bez horizontálneho scrollu pri šírke 390 px. Menu sa na mobile zalomí, nič sa neskryje.
- Texty v slovenčine. Kontakty, adresa a otváracie hodiny sú na jednom mieste v `app/data/site.ts`.
