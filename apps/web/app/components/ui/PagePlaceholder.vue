<script setup lang="ts">
/** Dočasný obsah stránky, ktorá ešte nie je hotová. Vyhľadávače ju neindexujú. */
const props = defineProps<{ title: string }>();

useSeoMeta({ title: props.title, robots: 'noindex' });
</script>

<template>
  <section class="container-page flex min-h-[50vh] flex-col items-start justify-center gap-5 py-20">
    <SectionEyebrow line>Pripravujeme</SectionEyebrow>
    <h1 class="display text-[clamp(2.75rem,6vw,4.5rem)]">{{ props.title }}</h1>
    <p class="max-w-lg text-ink-muted">Na tejto stránke pracujeme.</p>
    <BaseButton to="/" variant="ghost">Späť na úvod</BaseButton>
  </section>
</template>
