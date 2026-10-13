# Britva Barber – landing page

Landing page pre barbershop **Britva Barber** (Trnava). Dizajn vychádza z artefaktu *Britva Barber – landing page*.

Statická stránka bez build nástrojov – stačí otvoriť `index.html` alebo spustiť lokálny server:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Štruktúra

```
index.html        # obsah stránky (hero, služby, rezervácia, recenzie, lokalita, pätička, dialóg)
css/styles.css    # design tokeny (:root) + štýly sekcií, responzívne
js/main.js        # otváranie/zatváranie rezervačného dialógu
assets/img/       # obrázky
```

## Dizajn

- Tmavá téma, akcent `#d9a54c`, svetlá sekcia Služby
- Fonty: **Big Shoulders Display** (nadpisy), **Manrope** (text) cez Google Fonts
- Responzívne od 390 px do desktopu

## TODO

- Rezervačný dialóg: kroky služba → barber → termín → údaje, potvrdenie
- „Najbližší voľný termín“ z reálnej dostupnosti
- Skutočná mapa namiesto zástupného bloku
- Reálne kontakty, odkazy na sociálne siete a stránka Ochrana súkromia
