<script setup lang="ts">
import type { BookingDetails } from '@britva/shared';
import { mapsLinks } from '~/data/site';

const props = defineProps<{ booking: BookingDetails }>();

const firstName = computed(() => props.booking.customerName.trim().split(/\s+/)[0]);
const start = computed(() => new Date(props.booking.startsAt));
const date = computed(() => formatLongDate(localParts(start.value).date));
</script>

<template>
  <div class="flex flex-col items-start gap-4 py-3" role="status">
    <AppIcon name="check-circle" :size="60" :stroke-width="1.6" class="text-accent" />
    <h3
      class="font-display text-[44px] leading-none font-extrabold uppercase"
      tabindex="-1"
      data-step-heading
    >
      Hotovo, {{ firstName }}!
    </h3>
    <p class="max-w-[640px] text-lg text-ink-muted">
      <strong class="text-ink">{{ booking.service.name }}</strong> u barbera
      <strong class="text-ink">{{ booking.barber.name }}</strong> je potvrdený na
      <strong class="text-ink">{{ date }} o {{ formatTime(start) }}</strong
      >. Potvrdenie sme poslali SMS na číslo {{ booking.phone }}.
    </p>
    <p class="text-sm text-ink-dim">
      Kód rezervácie:
      <span class="font-bold tracking-[0.08em] text-accent">{{ booking.code }}</span>
    </p>
    <BaseButton variant="link" :href="mapsLinks.directions" new-tab>
      Naplánovať cestu v Google Maps →
    </BaseButton>
  </div>
</template>
