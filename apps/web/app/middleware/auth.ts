/** Iba pre prihlásených; inak presmeruje na prihlásenie a po ňom späť. */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loaded, loggedIn, refresh } = useAuth();
  if (!loaded.value) await refresh();
  if (!loggedIn.value) {
    return navigateTo({ path: '/prihlasenie', query: { redirect: to.fullPath } });
  }
});
