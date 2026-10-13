<script setup lang="ts">
import { canCancelBooking, type BookingDetails, type BookingStatus } from '@britva/shared';
import { site } from '~/data/site';

definePageMeta({ middleware: 'auth' });
useSeoMeta({ title: 'Moje rezervácie', robots: 'noindex' });

const api = useApi();
const auth = useAuth();
const booking = useBooking();

const {
  data: bookings,
  status,
  error,
  refresh,
} = useAsyncData('my-bookings', () => api<BookingDetails[]>('/bookings/me'), {
  default: () => [] as BookingDetails[],
});

const isActive = (b: BookingDetails) => b.status === 'pending' || b.status === 'confirmed';
const upcoming = computed(() =>
  bookings.value
    .filter((b) => isActive(b) && new Date(b.endsAt).getTime() > Date.now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
);
const history = computed(() => bookings.value.filter((b) => !upcoming.value.includes(b)));

const STATUS: Record<BookingStatus, string> = {
  pending: 'Čaká na potvrdenie',
  confirmed: 'Potvrdená',
  cancelled: 'Zrušená',
  completed: 'Dokončená',
};
const statusLabel = (b: BookingDetails) =>
  b.status === 'confirmed' && new Date(b.endsAt).getTime() <= Date.now()
    ? 'Prebehla'
    : STATUS[b.status];

const when = (b: BookingDetails) => {
  const start = new Date(b.startsAt);
  return `${formatLongDate(localParts(start).date)}, ${formatTime(start)} – ${formatTime(new Date(b.endsAt))}`;
};

const confirmingId = ref<string | null>(null);
const cancellingId = ref<string | null>(null);
const cancelError = ref<string | null>(null);

async function cancel(id: string) {
  cancellingId.value = id;
  cancelError.value = null;
  try {
    await api(`/bookings/${id}/cancel`, { method: 'PATCH' });
    confirmingId.value = null;
    await refresh();
  } catch (e) {
    cancelError.value = apiErrorMessage(e);
  } finally {
    cancellingId.value = null;
  }
}

async function logout() {
  await auth.signOut();
  await navigateTo('/');
}

// nová rezervácia z dialógu sa hneď ukáže v zozname
watch(
  () => booking.state.value.result,
  (result) => result && refresh(),
);

const firstName = computed(() => auth.user.value?.name.split(/\s+/)[0] ?? '');
</script>

<template>
  <section class="container-page flex flex-col gap-10 py-14 sm:py-20">
    <div class="flex flex-wrap items-end justify-between gap-6">
      <div class="flex flex-col gap-3">
        <SectionEyebrow line>Môj účet</SectionEyebrow>
        <h1 class="display text-[clamp(2.75rem,6vw,4.5rem)]">Ahoj, {{ firstName }}</h1>
        <p class="text-ink-muted">{{ auth.user.value?.email }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <BaseButton size="lg" @click="booking.open()">Nová rezervácia</BaseButton>
        <BaseButton size="lg" variant="ghost" @click="logout">Odhlásiť sa</BaseButton>
      </div>
    </div>

    <p
      v-if="error"
      role="alert"
      class="rounded-card border border-line bg-surface p-5 text-ink-muted"
    >
      Rezervácie sa nepodarilo načítať. Skús obnoviť stránku.
    </p>
    <p v-else-if="status === 'pending'" class="text-ink-muted">Načítavam rezervácie…</p>

    <template v-else>
      <section aria-labelledby="upcoming-title" class="flex flex-col gap-4">
        <h2 id="upcoming-title" class="font-display text-[32px] font-extrabold uppercase">
          Nadchádzajúce
        </h2>
        <p
          v-if="cancelError"
          role="alert"
          class="rounded-[14px] border border-red-400/40 bg-red-950/30 p-4 text-[15px] text-red-200"
        >
          {{ cancelError }}
        </p>
        <div
          v-if="upcoming.length === 0"
          class="flex flex-col items-start gap-4 rounded-panel border border-line bg-surface p-8"
        >
          <p class="text-lg text-ink-muted">Nemáš žiadnu nadchádzajúcu rezerváciu.</p>
          <BaseButton @click="booking.open()">Rezervovať termín</BaseButton>
        </div>
        <ul v-else class="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
          <li
            v-for="item in upcoming"
            :key="item.id"
            class="flex flex-col gap-4 rounded-card border border-line bg-surface p-6"
            :data-booking="item.code"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[13px] font-bold tracking-[0.12em] text-accent uppercase">
                  {{ statusLabel(item) }}
                </p>
                <h3 class="mt-1 text-xl font-bold">{{ item.service.name }}</h3>
                <p class="text-ink-muted">u barbera {{ item.barber.name }}</p>
              </div>
              <p class="font-display text-[30px] leading-none font-extrabold">
                {{ formatPrice(item.service.priceCents) }}
              </p>
            </div>
            <p class="font-semibold">{{ when(item) }}</p>
            <p class="text-sm text-ink-dim">
              Kód rezervácie
              <span class="font-bold tracking-[0.08em] text-accent">{{ item.code }}</span>
            </p>

            <div
              v-if="canCancelBooking(new Date(item.startsAt))"
              class="flex flex-wrap items-center gap-3"
            >
              <template v-if="confirmingId === item.id">
                <span class="text-sm text-ink-soft">Naozaj zrušiť?</span>
                <BaseButton :disabled="cancellingId === item.id" @click="cancel(item.id)">
                  {{ cancellingId === item.id ? 'Ruším…' : 'Áno, zrušiť' }}
                </BaseButton>
                <BaseButton variant="ghost" @click="confirmingId = null">Nechať</BaseButton>
              </template>
              <BaseButton v-else variant="ghost" @click="confirmingId = item.id"
                >Zrušiť rezerváciu</BaseButton
              >
            </div>
            <p v-else class="text-sm text-ink-dim">
              Do termínu ostáva menej ako 12 hodín – na zrušenie nám zavolaj na
              <a :href="site.phone.href" class="font-bold">{{ site.phone.display }}</a
              >.
            </p>
          </li>
        </ul>
      </section>

      <section v-if="history.length" aria-labelledby="history-title" class="flex flex-col gap-4">
        <h2 id="history-title" class="font-display text-[32px] font-extrabold uppercase">
          História
        </h2>
        <ul class="flex flex-col divide-y divide-line rounded-card border border-line">
          <li
            v-for="item in history"
            :key="item.id"
            class="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            :data-booking="item.code"
          >
            <span>
              <span class="font-semibold">{{ item.service.name }}</span>
              <span class="text-ink-dim"> · {{ item.barber.name }} · {{ when(item) }}</span>
            </span>
            <span
              class="text-sm font-semibold"
              :class="item.status === 'cancelled' ? 'text-ink-faint' : 'text-ink-soft'"
            >
              {{ statusLabel(item) }}
            </span>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>
