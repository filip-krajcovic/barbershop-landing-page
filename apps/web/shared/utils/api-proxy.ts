import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER } from '@britva/shared';

/**
 * Hlavičky pre request zo servera webu na API. Hodnoty sa nastavia vždy (aj prázdne),
 * aby sa cez proxy nedostali rovnomenné hlavičky podvrhnuté prehliadačom.
 */
export function apiProxyHeaders(secret: string, clientIp?: string | null): Record<string, string> {
  return { [PROXY_SECRET_HEADER]: secret, [CLIENT_IP_HEADER]: clientIp ?? '' };
}

/** Cieľová URL na API: `apiProxyUrl` bez koncového lomítka + cesta s query (`/api/...`). */
export function apiProxyTarget(apiProxyUrl: string, path: string): string {
  return apiProxyUrl.replace(/\/+$/, '') + path;
}
