<script setup lang="ts">
import { site } from '~/data/site';

// ŠABLÓNA: pred zverejnením doplň údaje v [hranatých zátvorkách] a nechaj text skontrolovať právnikom.
useSeoMeta({ title: 'Ochrana súkromia', robots: 'noindex' });
</script>

<template>
  <article
    class="container-page flex max-w-[760px] flex-col gap-6 py-14 sm:py-20 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-ink-muted [&_li]:text-ink-muted"
  >
    <SectionEyebrow line>Právne informácie</SectionEyebrow>
    <h1 class="display text-[clamp(2.75rem,6vw,4.5rem)]">Ochrana súkromia</h1>
    <p
      role="note"
      class="rounded-[14px] border border-accent/40 bg-surface p-4 text-[15px] text-ink-soft!"
    >
      Toto je šablóna. Pred spustením webu ju treba doplniť a nechať skontrolovať.
    </p>

    <h2>Prevádzkovateľ</h2>
    <p>
      {{ site.company }}, {{ site.address.street }}, {{ site.address.city }}, IČO: [DOPLNIŤ],
      e-mail: [DOPLNIŤ], telefón: {{ site.phone.display }}.
    </p>

    <h2>Aké údaje spracúvame a prečo</h2>
    <ul>
      <li>
        Rezervácia termínu: meno, telefón a poznámka, aby sme vedeli termín pripraviť a poslať SMS
        potvrdenie a pripomienku.
      </li>
      <li>
        Zákaznícky účet: meno, e-mail, telefón a heslo (uložené iba ako hash), aby si mal rezervácie
        na jednom mieste.
      </li>
      <li>
        Technické údaje: IP adresa a prehliadač pri prihlásení (bezpečnosť účtu, ochrana pred
        zneužitím).
      </li>
    </ul>

    <h2>Právny základ</h2>
    <p>
      Plnenie zmluvy (rezervácia služby) podľa čl. 6 ods. 1 písm. b) GDPR a oprávnený záujem na
      bezpečnosti služby podľa čl. 6 ods. 1 písm. f) GDPR.
    </p>

    <h2>Ako dlho údaje uchovávame</h2>
    <p>Údaje o rezervácii [DOPLNIŤ, napr. 12 mesiacov] od termínu; údaje účtu do jeho zrušenia.</p>

    <h2>Komu údaje poskytujeme</h2>
    <p>
      Poskytovateľovi SMS brány [DOPLNIŤ] a hostingu [DOPLNIŤ], výhradne na účely uvedené vyššie.
    </p>

    <h2>Tvoje práva</h2>
    <p>
      Máš právo na prístup k údajom, ich opravu, vymazanie, obmedzenie spracúvania, prenosnosť a
      podanie sťažnosti na Úrad na ochranu osobných údajov SR. Stačí nám napísať alebo zavolať.
    </p>
  </article>
</template>
