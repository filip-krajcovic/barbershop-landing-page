<script setup lang="ts">
import { site } from '~/data/site';

const { data: services, error } = useServices();
</script>

<template>
  <section id="sluzby" class="bg-paper text-paper-ink" aria-labelledby="sluzby-title">
    <div class="container-page flex flex-col gap-10 py-16 sm:py-22">
      <div class="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <h2 id="sluzby-title" class="display text-[clamp(2.75rem,6vw,4.5rem)]">
          Služby<br />a cenník
        </h2>
        <p class="max-w-[420px] text-paper-muted">
          Každá služba začína krátkou konzultáciou. Platiť môžeš hotovosťou aj kartou, ceny sú
          konečné.
        </p>
      </div>

      <p
        v-if="error"
        role="alert"
        class="rounded-card border border-paper-line p-5 text-paper-muted"
      >
        Cenník sa teraz nepodarilo načítať. Zavolaj nám na
        <a :href="site.phone.href" class="font-bold text-paper-accent">{{ site.phone.display }}</a
        >.
      </p>
      <ul
        v-else
        class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-x-12 border-t-2 border-paper-ink"
      >
        <li
          v-for="service in services"
          :key="service.id"
          class="flex items-start justify-between gap-5 border-b border-paper-line py-5.5"
        >
          <div class="flex min-w-0 flex-col gap-1">
            <h3 class="text-[19px] font-bold">{{ service.name }}</h3>
            <p class="text-sm text-[#5c554c]">{{ service.description }}</p>
            <p class="text-[13px] font-semibold text-[#6e665b]">{{ service.durationMin }} min</p>
          </div>
          <div class="flex flex-col items-end gap-0.5">
            <p class="font-display text-[34px] leading-none font-extrabold whitespace-nowrap">
              {{ formatPrice(service.priceCents) }}
            </p>
            <BaseButton
              variant="link"
              to="/#rezervacia"
              class="text-sm whitespace-nowrap text-paper-accent! hover:text-paper-ink!"
              :aria-label="`Rezervovať: ${service.name}`"
            >
              Rezervovať →
            </BaseButton>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
