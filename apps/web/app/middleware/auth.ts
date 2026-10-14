/** Iba pre prihlásených; inak presmeruje na prihlásenie a po ňom späť. */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, ensureLoaded } = useAuth();
  await ensureLoaded();
  if (!loggedIn.value) {
    return navigateTo({ path: '/prihlasenie', query: { redirect: to.fullPath } });
  }
});
