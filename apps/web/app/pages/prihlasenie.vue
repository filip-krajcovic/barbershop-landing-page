<script setup lang="ts">
definePageMeta({ middleware: 'guest' });
useSeoMeta({ title: 'Prihlásenie', robots: 'noindex' });

const route = useRoute();
const auth = useAuth();
const form = reactive({ email: '', password: '' });
const error = ref<string | null>(null);
const pending = ref(false);
const redirect = computed(() => safeRedirect(route.query.redirect));

async function submit() {
  error.value = null;
  pending.value = true;
  try {
    await auth.signIn(form.email.trim(), form.password);
    await navigateTo(redirect.value);
  } catch (e) {
    error.value =
      e instanceof AuthError ? e.message : 'Nepodarilo sa prihlásiť. Skús to, prosím, znova.';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <section class="container-page flex justify-center py-16 sm:py-24">
    <div class="flex w-full max-w-[440px] flex-col gap-6">
      <div class="flex flex-col gap-3">
        <SectionEyebrow line>Môj účet</SectionEyebrow>
        <h1 class="display text-[clamp(2.75rem,6vw,4rem)]">Prihlásenie</h1>
        <p class="text-ink-muted">Uvidíš svoje rezervácie a zrušíš ich jedným klikom.</p>
      </div>
      <form
        class="flex flex-col gap-4 rounded-panel border border-line bg-surface p-6 sm:p-8"
        novalidate
        @submit.prevent="submit"
      >
        <p
          v-if="error"
          role="alert"
          class="rounded-[14px] border border-red-400/40 bg-red-950/30 p-4 text-[15px] text-red-200"
        >
          {{ error }}
        </p>
        <FormField v-model="form.email" label="E-mail" type="email" autocomplete="email" required />
        <FormField
          v-model="form.password"
          label="Heslo"
          type="password"
          autocomplete="current-password"
          required
        />
        <BaseButton type="submit" size="lg" :disabled="pending || !form.email || !form.password">
          {{ pending ? 'Prihlasujem…' : 'Prihlásiť sa' }}
        </BaseButton>
      </form>
      <p class="text-ink-muted">
        Ešte nemáš účet?
        <NuxtLink :to="{ path: '/registracia', query: route.query }" class="font-bold"
          >Zaregistruj sa</NuxtLink
        >
      </p>
    </div>
  </section>
</template>
