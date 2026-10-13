<script setup lang="ts">
import { site } from '~/data/site';

const { data: services } = useServices();
/** Karta ukazuje prvú službu z cenníka (Pánsky strih). */
const service = computed(() => services.value[0]);
const { data: slot, status } = useNextFreeSlot(() => service.value?.id);

const booking = useBooking();

function pick() {
  if (!service.value) return booking.open();
  booking.open({
    serviceId: service.value.id,
    slot: slot.value ? { startsAt: slot.value.startsAt, endsAt: slot.value.endsAt } : undefined,
  });
}

const label = computed(() => {
  if (status.value === 'pending' || status.value === 'idle') return null;
  return slot.value ? formatSlotLabel(slot.value.startsAt) : 'Rezervuj online';
});
</script>

<template>
  <aside
    class="relative flex min-h-[440px] min-w-0 overflow-hidden rounded-panel border border-line bg-surface"
    aria-labelledby="next-slot-title"
  >
    <div
      class="w-12 shrink-0 bg-[repeating-linear-gradient(-35deg,var(--color-accent)_0_22px,var(--color-surface)_22px_34px,var(--color-ink)_34px_56px,var(--color-surface)_56px_68px)] sm:w-[92px]"
      aria-hidden="true"
    />
    <div class="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8">
      <h2
        id="next-slot-title"
        class="font-display text-[30px] leading-[1.05] font-extrabold uppercase"
      >
        Najbližší<br />voľný termín
      </h2>
      <div
        class="flex flex-col items-start gap-1.5 rounded-[18px] border border-line-soft bg-canvas p-5"
      >
        <p class="text-[13px] font-bold tracking-[0.12em] text-ink-dim uppercase">
          <template v-if="service">{{ service.name }} · {{ service.durationMin }} min</template>
          <template v-else>Online rezervácia</template>
        </p>
        <p
          class="min-h-11 font-display text-[clamp(2rem,3.4vw,2.75rem)] leading-none font-extrabold text-accent"
          aria-live="polite"
          data-testid="next-slot"
        >
          <span v-if="label">{{ label }}</span>
          <span v-else class="inline-block h-10 w-48 animate-pulse rounded-lg bg-surface-2" />
          <span v-if="!label" class="sr-only">Načítavam najbližší voľný termín…</span>
        </p>
        <BaseButton variant="link" class="mt-2 text-[15px]" @click="pick">
          {{ slot ? 'Vybrať tento termín →' : 'Vybrať termín →' }}
        </BaseButton>
      </div>
      <dl class="flex flex-col gap-2 text-sm text-ink-muted">
        <div v-for="row in site.openingHours" :key="row.days" class="flex justify-between gap-3">
          <dt>{{ row.days }}</dt>
          <dd class="font-semibold text-ink">{{ row.hours }}</dd>
        </div>
      </dl>
    </div>
  </aside>
</template>
