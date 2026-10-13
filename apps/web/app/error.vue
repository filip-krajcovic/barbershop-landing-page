<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();
const notFound = computed(() => props.error.statusCode === 404);

useSeoMeta({ title: () => (notFound.value ? 'Stránka neexistuje' : 'Chyba') });
</script>

<template>
  <NuxtLayout>
    <section
      class="container-page flex min-h-[60vh] flex-col items-start justify-center gap-6 py-24"
    >
      <SectionEyebrow line>Chyba {{ error.statusCode }}</SectionEyebrow>
      <h1 class="display text-[clamp(3rem,8vw,6rem)]">
        {{ notFound ? 'Tu nič nie je.' : 'Niečo sa pokazilo.' }}
      </h1>
      <p class="max-w-xl text-lg text-ink-muted">
        {{
          notFound
            ? 'Stránku, ktorú hľadáš, sme nenašli. Možno bola presunutá.'
            : 'Skús to, prosím, o chvíľu znova. Ak problém pretrváva, zavolaj nám.'
        }}
      </p>
      <BaseButton size="lg" @click="clearError({ redirect: '/' })">Späť na úvod</BaseButton>
    </section>
  </NuxtLayout>
</template>
