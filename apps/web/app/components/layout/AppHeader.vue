<script setup lang="ts">
const booking = useBooking();
const links = [
  { label: 'Služby', to: '/#sluzby' },
  { label: 'Recenzie', to: '/#recenzie' },
  { label: 'Kontakt', to: '/#lokalita' },
];
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-line bg-canvas/92 backdrop-blur-md">
    <div class="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3.5">
      <NuxtLink
        to="/"
        class="flex min-h-11 items-center gap-2.5 text-ink"
        aria-label="Britva Barber – úvod"
      >
        <AppLogo class="text-accent" />
        <span class="font-display text-[26px] font-extrabold tracking-[0.04em] uppercase"
          >Britva</span
        >
      </NuxtLink>
      <nav
        aria-label="Hlavná navigácia"
        class="flex flex-wrap items-center gap-x-5.5 gap-y-1 text-[15px] font-semibold"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="py-2.5 text-ink-soft transition-colors hover:text-accent-hover"
        >
          {{ link.label }}
        </NuxtLink>
        <BaseButton @click="booking.open()">Rezervovať</BaseButton>
      </nav>
    </div>
  </header>
</template>
