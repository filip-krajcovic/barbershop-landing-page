/** Sprístupní klienta better-auth ako `useNuxtApp().$authClient`. */
export default defineNuxtPlugin(() => {
  const { origin, headers } = useApiTarget();
  return { provide: { authClient: createBritvaAuthClient(origin, headers) } };
});
