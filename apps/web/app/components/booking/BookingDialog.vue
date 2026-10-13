<script setup lang="ts">
import { ANY_BARBER } from '@britva/shared';
import { BOOKING_STEPS } from '~/composables/useBooking';

const booking = useBooking();
const { state, canProceed, close, back, next } = booking;
const { data: services } = useServices();
const { data: barbers } = useBarbers(() => state.value.serviceId);

const dialog = ref<HTMLDialogElement>();
const service = computed(() => services.value.find((s) => s.id === state.value.serviceId));

const barLabel = computed(() => {
  const parts: string[] = [service.value?.name ?? 'Vyber službu'];
  if (state.value.serviceId) {
    parts.push(
      state.value.barberId === ANY_BARBER
        ? 'ktokoľvek'
        : (barbers.value.find((b) => b.id === state.value.barberId)?.name ?? ''),
    );
  }
  if (state.value.slot) {
    const start = new Date(state.value.slot.startsAt);
    parts.push(`${formatDayLabel(start).toLowerCase()} ${formatTime(start)}`);
  }
  return parts.filter(Boolean).join(' · ');
});

const hint = computed(() => {
  switch (state.value.step) {
    case 1:
      return 'Vyber službu.';
    case 2:
      return 'Vyber barbera alebo nechaj na nás.';
    case 3:
      return state.value.slot ? 'Termín je voľný, pokračuj.' : 'Vyber si čas.';
    default:
      return booking.contactErrors.value.name
        ? 'Doplň svoje meno.'
        : booking.contactErrors.value.phone
          ? 'Doplň telefón pre SMS potvrdenie.'
          : 'Všetko pripravené.';
  }
});

const stepTitle = computed(() =>
  state.value.result
    ? 'Rezervácia potvrdená'
    : `Krok ${state.value.step} zo 4: ${BOOKING_STEPS[state.value.step - 1]}`,
);

function sync(open: boolean) {
  const el = dialog.value;
  if (!el) return;
  if (open && !el.open) el.showModal();
  if (!open && el.open) el.close();
  document.documentElement.style.overflow = open ? 'hidden' : '';
}

watch(() => state.value.isOpen, sync, { flush: 'post' });
onMounted(() => sync(state.value.isOpen));
onBeforeUnmount(() => (document.documentElement.style.overflow = ''));

// Po zmene kroku presuň focus na nadpis kroku (čítačky obrazovky ho oznámia).
watch(
  () => [state.value.step, state.value.result] as const,
  async () => {
    await nextTick();
    dialog.value?.querySelector<HTMLElement>('[data-step-heading]')?.focus();
  },
);

/** Esc alebo form method=dialog – zladí stav s natívnym zatvorením. */
function onClose() {
  if (state.value.isOpen) close();
}

/** Klik na pozadie (mimo obsahu) zatvorí dialóg. */
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) close();
}
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="booking-title"
    :aria-describedby="'booking-step-title'"
    class="m-auto max-h-[min(820px,calc(100dvh-2rem))] w-[min(960px,calc(100%-2rem))] flex-col overflow-hidden rounded-[26px] border border-line-soft bg-overlay p-0 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop:bg-[rgba(8,7,6,0.78)] open:flex"
    @close="onClose"
    @click="onClick"
  >
    <header class="flex flex-col gap-4.5 border-b border-line px-5 py-5.5 sm:px-7">
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-col">
          <span class="text-xs font-bold tracking-[0.18em] text-accent uppercase"
            >Britva Barber · Trnava</span
          >
          <h2 id="booking-title" class="font-display text-[36px] leading-none font-black uppercase">
            Rezervácia termínu
          </h2>
          <p id="booking-step-title" class="sr-only">{{ stepTitle }}</p>
        </div>
        <button
          type="button"
          class="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-soft text-ink hover:border-accent"
          aria-label="Zavrieť rezerváciu"
          @click="close"
        >
          <AppIcon name="close" :size="20" :stroke-width="2.2" />
        </button>
      </div>
      <BookingStepper v-if="!state.result" />
    </header>

    <div class="flex-1 overflow-y-auto px-5 py-7 sm:px-7">
      <p
        v-if="state.error"
        role="alert"
        class="mb-5 rounded-[14px] border border-red-400/40 bg-red-950/30 p-4 text-[15px] text-red-200"
      >
        {{ state.error }}
      </p>
      <BookingSuccess v-if="state.result" :booking="state.result" />
      <StepService v-else-if="state.step === 1" />
      <StepBarber v-else-if="state.step === 2" />
      <StepSchedule v-else-if="state.step === 3" />
      <StepContact v-else />
    </div>

    <footer
      class="flex flex-wrap items-center justify-between gap-3.5 border-t border-line bg-canvas px-5 py-4.5 sm:px-7"
    >
      <div v-if="!state.result" class="flex min-w-0 flex-col">
        <span class="text-sm text-ink-dim">{{ barLabel }}</span>
        <span class="text-[13px] text-[#8a8276]" aria-live="polite">{{ hint }}</span>
      </div>
      <span v-else class="text-sm text-ink-dim">Tešíme sa na teba.</span>

      <div class="ml-auto flex items-center gap-3.5">
        <span
          v-if="!state.result && service"
          class="font-display text-[32px] leading-none font-extrabold text-accent"
        >
          {{ formatPrice(service.priceCents) }}
        </span>
        <BaseButton v-if="!state.result && state.step > 1" variant="ghost" @click="back"
          >Späť</BaseButton
        >
        <BaseButton
          v-if="!state.result"
          :disabled="(!canProceed && state.step !== 4) || state.submitting"
          @click="next"
        >
          {{
            state.step < 4 ? 'Pokračovať' : state.submitting ? 'Odosielam…' : 'Potvrdiť rezerváciu'
          }}
        </BaseButton>
        <BaseButton v-else @click="close">Zavrieť</BaseButton>
      </div>
    </footer>
  </dialog>
</template>
