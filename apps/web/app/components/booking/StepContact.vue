<script setup lang="ts">
const { state, contactErrors } = useBooking();

const showErrors = computed(() => state.value.submitAttempted);
const inputClass =
  'min-h-12.5 rounded-xl border bg-surface-2 px-4 text-base font-medium text-ink placeholder:text-[#7d766c] focus:border-accent focus:outline-none';
</script>

<template>
  <div class="flex flex-wrap items-start gap-7">
    <form class="flex min-w-0 flex-[999_1_380px] flex-col gap-3.5" novalidate @submit.prevent>
      <h3 class="text-[22px] font-bold" tabindex="-1" data-step-heading>Posledný krok – kontakt</h3>

      <label class="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
        Meno a priezvisko
        <input
          v-model="state.name"
          type="text"
          autocomplete="name"
          placeholder="Ján Novák"
          :class="[
            inputClass,
            showErrors && contactErrors.name ? 'border-red-400' : 'border-line-strong',
          ]"
          :aria-invalid="showErrors && !!contactErrors.name"
          aria-describedby="booking-name-error"
        />
        <span
          v-if="showErrors && contactErrors.name"
          id="booking-name-error"
          class="text-[13px] text-red-300"
        >
          {{ contactErrors.name }}
        </span>
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
        Telefón (príde naň SMS potvrdenie)
        <input
          v-model="state.phone"
          type="tel"
          autocomplete="tel"
          placeholder="+421 9xx xxx xxx"
          :class="[
            inputClass,
            showErrors && contactErrors.phone ? 'border-red-400' : 'border-line-strong',
          ]"
          :aria-invalid="showErrors && !!contactErrors.phone"
          aria-describedby="booking-phone-error"
        />
        <span
          v-if="showErrors && contactErrors.phone"
          id="booking-phone-error"
          class="text-[13px] text-red-300"
        >
          {{ contactErrors.phone }}
        </span>
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
        Poznámka pre barbera (nepovinné)
        <input
          v-model="state.note"
          type="text"
          maxlength="500"
          placeholder="Napr. chcem skrátiť bradu, ale nechať dĺžku"
          :class="[inputClass, 'border-line-strong']"
        />
      </label>
    </form>
    <BookingSummary class="min-w-0 flex-[1_1_260px]" />
  </div>
</template>
