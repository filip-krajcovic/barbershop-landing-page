<script setup lang="ts">
import { site } from '~/data/site';

const booking = useBooking();

const stats = [
  {
    value: site.rating.value.toLocaleString('sk-SK'),
    label: `priemer z ${site.rating.count} recenzií Google`,
  },
  { value: '1:1', label: 'individuálny prístup' },
  { value: '24/7', label: 'online rezervácia' },
];
</script>

<template>
  <section
    id="top"
    class="container-page flex flex-wrap items-stretch gap-8 pt-10 pb-16 sm:gap-12 sm:pt-18"
  >
    <div class="flex min-w-0 flex-[999_1_520px] flex-col justify-center gap-6.5">
      <SectionEyebrow line>Barbershop · Trnava · od {{ site.founded }}</SectionEyebrow>
      <h1 class="display text-[clamp(3.5rem,9vw,7rem)] leading-[0.92] tracking-[0.01em]">
        Strih, ktorý<br />drží celý<br /><span class="text-accent">týždeň.</span>
      </h1>
      <p class="max-w-[520px] text-lg text-ink-muted">
        Klasické pánske strihy, fade, úprava brady a holenie britvou s horúcim uterákom. Jeden
        barber, jeden klient, žiadne čakanie v rade.
      </p>
      <div class="flex flex-wrap gap-3">
        <BaseButton size="lg" @click="booking.open()">Rezervovať termín</BaseButton>
        <BaseButton size="lg" variant="ghost" to="/#sluzby">Cenník služieb</BaseButton>
      </div>
      <dl class="mt-2.5 grid max-w-[560px] grid-cols-3 gap-4 border-t border-line pt-6.5">
        <!-- flex-col-reverse: číslo nad popisom; justify-end ho drží hore aj pri zalomenom popise -->
        <div v-for="stat in stats" :key="stat.value" class="flex flex-col-reverse justify-end">
          <dt class="text-[13px] text-ink-dim">{{ stat.label }}</dt>
          <dd class="font-display text-[40px] leading-none font-extrabold">{{ stat.value }}</dd>
        </div>
      </dl>
    </div>
    <NextSlotCard class="flex-[1_1_340px]" />
  </section>
</template>
