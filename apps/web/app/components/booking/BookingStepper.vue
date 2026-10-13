<script setup lang="ts">
import { BOOKING_STEPS, type BookingStep } from '~/composables/useBooking';

const { state, canGoTo, goTo } = useBooking();
</script>

<template>
  <ol class="grid grid-cols-4 gap-2" aria-label="Kroky rezervácie">
    <li v-for="(label, index) in BOOKING_STEPS" :key="label" class="flex flex-col gap-2">
      <span
        class="block h-1 rounded"
        :class="index + 1 <= state.step ? 'bg-accent' : 'bg-line-soft'"
        aria-hidden="true"
      />
      <button
        type="button"
        class="min-h-8 text-left text-sm disabled:cursor-not-allowed"
        :class="
          index + 1 === state.step
            ? 'font-extrabold text-ink'
            : index + 1 < state.step
              ? 'font-semibold text-ink-soft'
              : 'font-semibold text-[#7d766c]'
        "
        :aria-current="index + 1 === state.step ? 'step' : undefined"
        :disabled="!canGoTo((index + 1) as BookingStep)"
        @click="goTo((index + 1) as BookingStep)"
      >
        {{ index + 1 }}. {{ label }}
      </button>
    </li>
  </ol>
</template>
