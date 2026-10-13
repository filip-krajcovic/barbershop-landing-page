<script setup lang="ts">
import type { IconName } from '~/components/ui/AppIcon.vue';

const perks: { icon: IconName; title: string; subtitle: string }[] = [
  { icon: 'clock', title: 'Za menej ako minútu', subtitle: '4 krátke kroky, bez registrácie' },
  { icon: 'phone', title: 'SMS potvrdenie', subtitle: 'aj pripomienka deň vopred' },
  { icon: 'refresh', title: 'Bezplatné zrušenie', subtitle: 'najneskôr 12 hodín vopred' },
];
</script>

<template>
  <section id="rezervacia" class="container-page py-16 sm:py-24" aria-labelledby="rezervacia-title">
    <div class="flex flex-wrap overflow-hidden rounded-panel border border-line bg-surface">
      <div class="flex min-w-0 flex-[999_1_520px] flex-col items-start gap-5.5 p-8 sm:p-12">
        <SectionEyebrow>Online rezervácia</SectionEyebrow>
        <h2 id="rezervacia-title" class="display text-[clamp(2.75rem,6vw,4.5rem)]">
          Kreslo je<br />voľné.
        </h2>
        <p class="max-w-[480px] text-[17px] text-ink-muted">
          Vyber si službu, barbera a čas. Celé to zaberie menej ako minútu a potvrdenie ti príde
          SMS.
        </p>
        <BaseButton size="lg" to="/#rezervacia">Otvoriť rezerváciu</BaseButton>
      </div>
      <ul
        class="flex min-w-0 flex-[1_1_320px] flex-col justify-center gap-5.5 border-t border-line p-8 sm:p-12 lg:border-t-0 lg:border-l"
      >
        <li v-for="perk in perks" :key="perk.title">
          <IconInfoItem :icon="perk.icon" :title="perk.title" :subtitle="perk.subtitle" />
        </li>
      </ul>
    </div>
  </section>
</template>
