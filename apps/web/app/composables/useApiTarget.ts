/**
 * Kam volať API. V prehliadači vlastný origin webu – `/api/**` prepošle server webu
 * (`server/api/[...].ts`). Pri SSR priamo API (`NUXT_API_PROXY_URL`) s cookie z requestu
 * a tajnou hlavičkou, bez zbytočného skoku cez vlastný server.
 */
export function useApiTarget(): { origin: string; headers?: Record<string, string> } {
  if (import.meta.server) {
    const { apiProxyUrl, apiProxySecret } = useRuntimeConfig();
    return {
      origin: apiProxyTarget(apiProxyUrl, ''),
      headers: {
        ...useRequestHeaders(['cookie']),
        ...apiProxyHeaders(apiProxySecret, useRequestHeader('cf-connecting-ip')),
      },
    };
  }
  return { origin: useRequestURL().origin };
}
