/** Prihlásenie a registrácia nemajú zmysel pre prihláseného – pošli ho na jeho rezervácie. */
export default defineNuxtRouteMiddleware(async () => {
  const { loaded, loggedIn, refresh } = useAuth();
  if (!loaded.value) await refresh();
  if (loggedIn.value) return navigateTo('/moje-rezervacie');
});
