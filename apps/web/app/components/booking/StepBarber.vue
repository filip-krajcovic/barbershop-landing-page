<script setup lang="ts">
import { ANY_BARBER } from '@britva/shared';

const { state, selectBarber } = useBooking();
const { data: barbers, status } = useBarbers(() => state.value.serviceId);

const options = computed(() => [
  { id: ANY_BARBER, name: 'Ktokoľvek', role: 'Najbližší voľný termín', initial: '*' },
  ...barbers.value.map((b) => ({
    id: b.id,
    name: b.name,
    role: b.role,
    initial: b.name.charAt(0),
  })),
]);
</script>

<template>
  <div class="flex flex-col gap-4">
    <h3 class="text-[22px] font-bold" tabindex="-1" data-step-heading>Ku komu chceš ísť?</h3>
    <p v-if="status === 'pending'" class="text-ink-muted">Načítavam barberov…</p>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-2.5">
      <OptionCard
        v-for="option in options"
        :key="option.id"
        :selected="state.barberId === option.id"
        class="p-5"
        @select="selectBarber(option.id)"
      >
        <span
          class="mb-3 flex size-14 items-center justify-center rounded-full bg-[#2c2925] text-xl font-extrabold text-ink"
          aria-hidden="true"
        >
          {{ option.initial }}
        </span>
        <span class="block text-[17px] font-bold">{{ option.name }}</span>
        <span class="block text-[13px] opacity-85">{{ option.role }}</span>
      </OptionCard>
    </div>
  </div>
</template>
