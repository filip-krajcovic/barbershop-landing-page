/** Sprístupní klienta better-auth ako `useNuxtApp().$authClient`. */
export default defineNuxtPlugin(() => {
  const { public: config } = useRuntimeConfig();
  return { provide: { authClient: createBritvaAuthClient(config.apiUrl) } };
});
