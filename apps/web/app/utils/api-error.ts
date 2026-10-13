/** Používateľsky zrozumiteľná správa z chyby API (`{ statusCode, message, errors? }`). */
export function apiErrorMessage(
  error: unknown,
  fallback = 'Nastala chyba. Skús to, prosím, znova.',
): string {
  const data = (error as { data?: { message?: unknown } } | null)?.data;
  return typeof data?.message === 'string' && data.message ? data.message : fallback;
}

/** HTTP status chyby z `$fetch`, ak je k dispozícii. */
export function apiErrorStatus(error: unknown): number | undefined {
  const status = (error as { statusCode?: unknown; status?: unknown } | null)?.statusCode;
  return typeof status === 'number' ? status : undefined;
}
