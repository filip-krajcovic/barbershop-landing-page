/** Klient better-auth z pluginu `auth-client` (samostatne kvôli mockovaniu v testoch). */
export function useAuthClient(): BritvaAuthClient {
  return useNuxtApp().$authClient as BritvaAuthClient;
}
