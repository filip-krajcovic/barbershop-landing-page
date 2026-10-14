import type { UserRole } from '@britva/shared';
import { initialBookingState, type BookingState } from './useBooking';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
}

export class AuthError extends Error {}

/**
 * Prihlásený používateľ a akcie better-auth. Session sa načíta raz pri štarte
 * aplikácie (aj pri SSR s cookie z prehliadača) a zdieľa sa cez `useState`.
 */
export function useAuth() {
  const $authClient = useAuthClient();
  const user = useState<AuthUser | null>('auth-user', () => null);
  const loaded = useState('auth-loaded', () => false);
  const bookingState = useState<BookingState>('booking', initialBookingState);

  async function refresh() {
    const { data } = await $authClient.getSession();
    const u = data?.user;
    user.value = u
      ? { id: u.id, name: u.name, email: u.email, role: u.role as UserRole, phone: u.phone ?? null }
      : null;
    loaded.value = true;
  }

  /** Načíta session, ak ešte nie je načítaná. Ak API neodpovedá, používateľ ostane neprihlásený. */
  async function ensureLoaded() {
    if (loaded.value) return;
    await refresh().catch(() => undefined);
  }

  async function signIn(email: string, password: string) {
    const { error } = await $authClient.signIn.email({ email, password });
    if (error) throw new AuthError(authErrorMessage(error));
    await refresh();
  }

  async function signUp(input: { name: string; email: string; password: string; phone?: string }) {
    const { error } = await $authClient.signUp.email({
      name: input.name,
      email: input.email,
      password: input.password,
      phone: input.phone || undefined,
    });
    if (error) throw new AuthError(authErrorMessage(error));
    await refresh();
  }

  async function signOut() {
    await $authClient.signOut();
    user.value = null;
    // Osobné údaje z rozpracovanej rezervácie nenechávame na zdieľanom zariadení.
    // Stav sa resetuje, nie maže – dialóg ho sleduje a `undefined` by ho rozbilo.
    bookingState.value = initialBookingState();
  }

  return {
    user,
    loaded,
    loggedIn: computed(() => user.value !== null),
    refresh,
    ensureLoaded,
    signIn,
    signUp,
    signOut,
  };
}
