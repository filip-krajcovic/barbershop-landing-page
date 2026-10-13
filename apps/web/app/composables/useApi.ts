/**
 * Klient pre NestJS API: `useApi()('/services')`.
 * Posiela cookies (session better-auth); pri SSR prepošle cookie z requestu prehliadača.
 */
export function useApi() {
  const config = useRuntimeConfig();
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;
  return $fetch.create({
    baseURL: `${config.public.apiUrl}/api`,
    credentials: 'include',
    headers,
  });
}
