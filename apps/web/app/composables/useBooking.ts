import {
  ANY_BARBER,
  phoneSchema,
  type BarberIdOrAny,
  type BookingDetails,
  type CreateBookingInput,
  type Me,
} from '@britva/shared';

export type BookingStep = 1 | 2 | 3 | 4;

export interface SelectedSlot {
  startsAt: string;
  endsAt: string;
}

export interface BookingState {
  isOpen: boolean;
  step: BookingStep;
  serviceId: string | null;
  barberId: BarberIdOrAny;
  date: string | null;
  slot: SelectedSlot | null;
  name: string;
  phone: string;
  note: string;
  /** Kontakt sa zobrazí s chybami až po prvom pokuse o odoslanie. */
  submitAttempted: boolean;
  submitting: boolean;
  error: string | null;
  /** Zvýši sa, keď treba znova načítať sloty (napr. po 409). */
  slotsVersion: number;
  result: BookingDetails | null;
}

export interface BookingPreset {
  serviceId?: string;
  /** Predvybraný termín (karta „Najbližší voľný termín“). */
  slot?: SelectedSlot;
}

export const BOOKING_STEPS = ['Služba', 'Barber', 'Termín', 'Údaje'] as const;

/** Počiatočný (prázdny) stav rezervácie. */
export const initialBookingState = (): BookingState => ({
  isOpen: false,
  step: 1,
  serviceId: null,
  barberId: ANY_BARBER,
  date: null,
  slot: null,
  name: '',
  phone: '',
  note: '',
  submitAttempted: false,
  submitting: false,
  error: null,
  slotsVersion: 0,
  result: null,
});

/**
 * Stav a akcie rezervačného dialógu. Stav je globálny (`useState`), takže dialóg
 * môže otvoriť ktorékoľvek tlačidlo na stránke s predvolenou službou alebo termínom.
 */
export function useBooking() {
  const state = useState<BookingState>('booking', initialBookingState);
  const api = useApi();

  const contactErrors = computed(() => {
    const errors: { name?: string; phone?: string } = {};
    if (state.value.name.trim().length < 2) errors.name = 'Zadaj meno a priezvisko.';
    if (!phoneSchema.safeParse(state.value.phone).success) {
      errors.phone = 'Zadaj telefón, napr. +421 900 123 456.';
    }
    return errors;
  });

  const canProceed = computed(() => {
    switch (state.value.step) {
      case 1:
        return state.value.serviceId !== null;
      case 2:
        return true;
      case 3:
        return state.value.slot !== null;
      case 4:
        return Object.keys(contactErrors.value).length === 0;
    }
    return false;
  });

  /** Na krok sa dá preskočiť, ak sú vyplnené všetky predchádzajúce. */
  function canGoTo(step: BookingStep): boolean {
    if (step === 1) return true;
    if (!state.value.serviceId) return false;
    if (step === 4) return state.value.slot !== null;
    return true;
  }

  /**
   * Predvyplní meno a telefón prihláseného používateľa. `get-session` vracia pre
   * neprihláseného 200 + null (na rozdiel od /me nevznikne v konzole chyba 401).
   */
  async function prefillContact() {
    if (state.value.name || state.value.phone) return;
    try {
      const session = await api<{ user: Pick<Me, 'name' | 'phone'> } | null>('/auth/get-session');
      if (!session) return;
      state.value.name ||= session.user.name;
      state.value.phone ||= session.user.phone ?? '';
    } catch {
      // predvyplnenie je iba pohodlie – chyba nevadí
    }
  }

  function open(preset: BookingPreset = {}) {
    const { name, phone, note } = state.value;
    state.value = { ...initialBookingState(), name, phone, note, isOpen: true };
    if (preset.serviceId) {
      state.value.serviceId = preset.serviceId;
      state.value.step = 2;
      if (preset.slot) {
        state.value.slot = preset.slot;
        state.value.date = localParts(new Date(preset.slot.startsAt)).date;
        state.value.step = 3;
      }
    }
    void prefillContact();
  }

  function close() {
    const done = state.value.result !== null;
    state.value.isOpen = false;
    // po úspešnej rezervácii začne ďalšia odznova (kontakt ostane)
    if (done) {
      const { name, phone } = state.value;
      state.value = { ...initialBookingState(), name, phone };
    }
  }

  function goTo(step: BookingStep) {
    if (canGoTo(step)) {
      state.value.step = step;
      state.value.error = null;
    }
  }

  function selectService(id: string) {
    if (state.value.serviceId !== id) state.value.slot = null;
    state.value.serviceId = id;
    goTo(2);
  }

  function selectBarber(id: BarberIdOrAny) {
    if (state.value.barberId !== id) state.value.slot = null;
    state.value.barberId = id;
    goTo(3);
  }

  function selectDate(date: string) {
    if (state.value.date !== date) state.value.slot = null;
    state.value.date = date;
  }

  function selectSlot(slot: SelectedSlot) {
    state.value.slot = slot;
    state.value.error = null;
  }

  function back() {
    if (state.value.step > 1) goTo((state.value.step - 1) as BookingStep);
  }

  async function next() {
    if (state.value.step === 4) return submit();
    if (canProceed.value) goTo((state.value.step + 1) as BookingStep);
  }

  async function submit() {
    state.value.submitAttempted = true;
    const { serviceId, slot } = state.value;
    if (!serviceId || !slot || !canProceed.value || state.value.submitting) return;

    state.value.submitting = true;
    state.value.error = null;
    const body: CreateBookingInput = {
      serviceId,
      barberId: state.value.barberId,
      startsAt: slot.startsAt,
      customerName: state.value.name,
      phone: state.value.phone,
      note: state.value.note.trim() || undefined,
    };
    try {
      state.value.result = await api<BookingDetails>('/bookings', { method: 'POST', body });
    } catch (error) {
      const status = apiErrorStatus(error);
      if (status === 409) {
        state.value.slot = null;
        state.value.step = 3;
        state.value.slotsVersion++;
        state.value.error = 'Tento termín medzitým niekto obsadil. Vyber si, prosím, iný.';
      } else if (status === 429) {
        state.value.error = 'Príliš veľa pokusov. Skús to, prosím, o minútu.';
      } else {
        state.value.error = apiErrorMessage(error);
      }
    } finally {
      state.value.submitting = false;
    }
  }

  return {
    state,
    contactErrors,
    canProceed,
    canGoTo,
    open,
    close,
    goTo,
    selectService,
    selectBarber,
    selectDate,
    selectSlot,
    back,
    next,
    submit,
  };
}
