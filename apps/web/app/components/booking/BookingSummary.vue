<script setup lang="ts">
import { ANY_BARBER } from '@britva/shared';

const { state } = useBooking();
const { data: services } = useServices();
const { data: barbers } = useBarbers(() => state.value.serviceId);

const service = computed(() => services.value.find((s) => s.id === state.value.serviceId));
const barberName = computed(() =>
  state.value.barberId === ANY_BARBER
    ? 'ktokoľvek voľný'
    : (barbers.value.find((b) => b.id === state.value.barberId)?.name ?? '—'),
);
const time = computed(() =>
  state.value.slot
    ? `${formatTime(new Date(state.value.slot.startsAt))} – ${formatTime(new Date(state.value.slot.endsAt))}`
    : '—',
);
</script>

<template>
  <section
    class="flex flex-col gap-2.5 rounded-[18px] border border-line bg-surface-2 p-5 text-sm"
    aria-labelledby="booking-summary-title"
  >
    <h4 id="booking-summary-title" class="mb-1 text-[15px] font-bold">Tvoja rezervácia</h4>
    <dl class="flex flex-col gap-2.5">
      <div class="flex justify-between gap-3">
        <dt class="text-ink-dim">Služba</dt>
        <dd class="text-right font-semibold">{{ service?.name ?? '—' }}</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-ink-dim">Barber</dt>
        <dd class="text-right font-semibold">{{ barberName }}</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-ink-dim">Dátum</dt>
        <dd class="text-right font-semibold">
          {{ state.date ? formatLongDate(state.date) : '—' }}
        </dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-ink-dim">Čas</dt>
        <dd class="text-right font-semibold tabular-nums">{{ time }}</dd>
      </div>
      <div v-if="service" class="flex justify-between gap-3">
        <dt class="text-ink-dim">Cena</dt>
        <dd class="text-right font-semibold">{{ formatPrice(service.priceCents) }}</dd>
      </div>
    </dl>
    <p class="mt-1.5 text-xs text-[#8a8276]">Bezplatné zrušenie najneskôr 12 hodín vopred.</p>
  </section>
</template>
