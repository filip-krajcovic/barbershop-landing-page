/**
 * Klient pre NestJS API: `useApi()('/services')`.
 * Posiela cookies (session better-auth); kam presne volá, určuje `useApiTarget`.
 */
export function useApi() {
  const { origin, headers } = useApiTarget();
  return $fetch.create({
    baseURL: `${origin}/api`,
    credentials: 'include',
    headers,
  });
}
