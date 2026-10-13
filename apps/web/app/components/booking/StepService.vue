<script setup lang="ts">
const { state, selectService } = useBooking();
const { data: services, status } = useServices();
</script>

<template>
  <div class="flex flex-col gap-4">
    <h3 class="text-[22px] font-bold" tabindex="-1" data-step-heading>Akú službu si dáš?</h3>
    <p v-if="status === 'pending'" class="text-ink-muted">Načítavam služby…</p>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-2.5">
      <OptionCard
        v-for="service in services"
        :key="service.id"
        :selected="state.serviceId === service.id"
        class="min-h-16 px-4.5 py-4"
        @select="selectService(service.id)"
      >
        <span class="flex items-baseline justify-between gap-3">
          <span class="text-base font-bold">{{ service.name }}</span>
          <span class="font-display text-[22px] font-extrabold">{{
            formatPrice(service.priceCents)
          }}</span>
        </span>
        <span class="mt-1 block text-[13px] opacity-85">{{ service.description }}</span>
        <span class="mt-1.5 block text-xs font-bold opacity-80">{{ service.durationMin }} min</span>
      </OptionCard>
    </div>
  </div>
</template>
