/** Prihlásenie a registrácia nemajú zmysel pre prihláseného – pošli ho na jeho rezervácie. */
export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, ensureLoaded } = useAuth();
  await ensureLoaded();
  if (loggedIn.value) return navigateTo('/moje-rezervacie');
});
