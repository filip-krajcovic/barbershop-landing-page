<script setup lang="ts">
import type { AvailabilityResponse } from '@britva/shared';

const { state, selectDate, selectSlot } = useBooking();
const api = useApi();
const days = upcomingDays(10);

if (!state.value.date || !days.some((d) => d.date === state.value.date)) {
  selectDate(days[0]!.date);
}

const { data, status } = useAsyncData(
  () =>
    `slots-${state.value.serviceId}-${state.value.barberId}-${state.value.date}-${state.value.slotsVersion}`,
  () =>
    api<AvailabilityResponse>('/availability', {
      query: {
        serviceId: state.value.serviceId,
        barberId: state.value.barberId,
        date: state.value.date,
      },
    }),
  { server: false, default: () => null },
);

const slots = computed(() => data.value?.slots ?? []);
const noSlots = computed(
  () => status.value === 'success' && slots.value.every((s) => !s.available),
);
</script>

<template>
  <div class="flex flex-col gap-4.5">
    <h3 class="text-[22px] font-bold" tabindex="-1" data-step-heading>Kedy ti to vyhovuje?</h3>

    <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1.5" role="group" aria-label="Deň">
      <OptionCard
        v-for="day in days"
        :key="day.date"
        :selected="state.date === day.date"
        class="min-h-22 w-19 shrink-0 px-1.5 py-2.5 text-center!"
        :aria-label="formatLongDate(day.date)"
        @select="selectDate(day.date)"
      >
        <span class="block text-[13px] font-semibold opacity-80">{{ day.dow }}</span>
        <span class="block font-display text-[26px] leading-tight font-extrabold">{{
          day.day
        }}</span>
        <span class="block text-xs opacity-80">{{ day.month }}</span>
      </OptionCard>
    </div>

    <div
      v-if="status === 'pending'"
      class="grid grid-cols-[repeat(auto-fill,minmax(86px,1fr))] gap-2"
      aria-busy="true"
    >
      <span v-for="i in 12" :key="i" class="h-11.5 animate-pulse rounded-xl bg-surface-2" />
      <span class="sr-only">Načítavam voľné termíny…</span>
    </div>
    <p
      v-else-if="status === 'error'"
      role="alert"
      class="rounded-[14px] bg-surface-2 p-4 text-ink-muted"
    >
      Termíny sa nepodarilo načítať. Skús to, prosím, znova.
    </p>
    <template v-else>
      <div
        class="grid grid-cols-[repeat(auto-fill,minmax(86px,1fr))] gap-2"
        role="group"
        aria-label="Čas"
      >
        <button
          v-for="slot in slots"
          :key="slot.startsAt"
          type="button"
          :disabled="!slot.available"
          :aria-pressed="state.slot?.startsAt === slot.startsAt"
          class="min-h-11.5 rounded-xl border text-[15px] font-bold tabular-nums transition-colors"
          :class="
            !slot.available
              ? 'cursor-not-allowed border-dashed border-[#3a362f] text-[#5f594f] line-through'
              : state.slot?.startsAt === slot.startsAt
                ? 'border-accent bg-accent text-on-accent'
                : 'border-line-strong text-ink hover:border-accent'
          "
          @click="selectSlot({ startsAt: slot.startsAt, endsAt: slot.endsAt })"
        >
          {{ formatTime(new Date(slot.startsAt)) }}
          <span v-if="!slot.available" class="sr-only">(obsadené)</span>
        </button>
      </div>
      <p v-if="noSlots" class="rounded-[14px] bg-surface-2 p-4 text-[15px] text-ink-muted">
        Na tento deň už nie je voľný termín. Skús iný deň alebo iného barbera.
      </p>
    </template>

    <ul class="flex flex-wrap gap-4 text-[13px] text-ink-dim" aria-hidden="true">
      <li class="flex items-center gap-1.5">
        <span class="size-3 rounded-[3px] border border-line-strong" />voľné
      </li>
      <li class="flex items-center gap-1.5">
        <span class="size-3 rounded-[3px] border border-dashed border-[#3a362f]" />obsadené
      </li>
      <li class="flex items-center gap-1.5">
        <span class="size-3 rounded-[3px] bg-accent" />tvoj výber
      </li>
    </ul>
  </div>
</template>
