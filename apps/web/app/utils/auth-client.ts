import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/vue';

/**
 * Klient better-auth pre API (`<apiUrl>/api/auth/*`). Dodatočné polia používateľa
 * zodpovedajú serveru: `role` (iba na čítanie) a voliteľný `phone`.
 */
export function createBritvaAuthClient(apiUrl: string) {
  return createAuthClient({
    baseURL: apiUrl,
    basePath: '/api/auth',
    fetchOptions: { credentials: 'include' },
    plugins: [
      inferAdditionalFields({
        user: {
          role: { type: 'string', input: false },
          phone: { type: 'string', required: false },
        },
      }),
    ],
  });
}

export type BritvaAuthClient = ReturnType<typeof createBritvaAuthClient>;

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Nesprávny e-mail alebo heslo.',
  USER_ALREADY_EXISTS: 'Účet s týmto e-mailom už existuje. Prihlás sa.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Účet s týmto e-mailom už existuje. Prihlás sa.',
  PASSWORD_TOO_SHORT: 'Heslo musí mať aspoň 8 znakov.',
  PASSWORD_TOO_LONG: 'Heslo je príliš dlhé.',
  INVALID_EMAIL: 'Zadaj platný e-mail.',
};

/** Zrozumiteľná slovenská správa z chyby better-auth (`{ code, status, message }`). */
export function authErrorMessage(
  error: { code?: string; status?: number } | null | undefined,
): string {
  if (error?.status === 429) return 'Príliš veľa pokusov. Skús to, prosím, o chvíľu.';
  return (error?.code && ERROR_MESSAGES[error.code]) || 'Nepodarilo sa to. Skús to, prosím, znova.';
}

/**
 * Cieľ presmerovania po prihlásení – iba interná cesta (ochrana pred open redirect,
 * napr. `?redirect=https://zla-stranka.sk` alebo `//zla-stranka.sk`).
 */
export function safeRedirect(value: unknown, fallback = '/moje-rezervacie'): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  ) {
    return fallback;
  }
  return value;
}
