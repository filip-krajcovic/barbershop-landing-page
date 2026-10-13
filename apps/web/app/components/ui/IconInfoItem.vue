<script setup lang="ts">
import type { IconName } from './AppIcon.vue';

/** Riadok ikona + titulok + popis (kontakt, výhody rezervácie). Titulok sa dá nahradiť slotom. */
defineProps<{ icon: IconName; title?: string; subtitle?: string }>();
</script>

<template>
  <div class="flex items-start gap-3.5">
    <AppIcon :name="icon" class="mt-0.5 shrink-0 text-accent" />
    <div>
      <div class="font-bold">
        <slot>{{ title }}</slot>
      </div>
      <div v-if="subtitle" class="text-sm text-ink-dim">{{ subtitle }}</div>
    </div>
  </div>
</template>
