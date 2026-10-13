<script setup lang="ts">
import { phoneSchema } from '@britva/shared';

definePageMeta({ middleware: 'guest' });
useSeoMeta({ title: 'Registrácia', robots: 'noindex' });

const route = useRoute();
const auth = useAuth();
const form = reactive({ name: '', email: '', phone: '', password: '' });
const attempted = ref(false);
const error = ref<string | null>(null);
const pending = ref(false);

const errors = computed(() => {
  const e: Partial<Record<keyof typeof form, string>> = {};
  if (form.name.trim().length < 2) e.name = 'Zadaj meno a priezvisko.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Zadaj platný e-mail.';
  if (form.phone.trim() && !phoneSchema.safeParse(form.phone).success) {
    e.phone = 'Zadaj telefón, napr. +421 900 123 456.';
  }
  if (form.password.length < 8) e.password = 'Heslo musí mať aspoň 8 znakov.';
  return e;
});
const shown = (field: keyof typeof form) => (attempted.value ? errors.value[field] : undefined);

async function submit() {
  attempted.value = true;
  error.value = null;
  if (Object.keys(errors.value).length > 0) return;
  pending.value = true;
  try {
    const phone = form.phone.trim() ? phoneSchema.parse(form.phone) : undefined;
    await auth.signUp({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone,
    });
    await navigateTo(safeRedirect(route.query.redirect));
  } catch (e) {
    error.value =
      e instanceof AuthError ? e.message : 'Registrácia sa nepodarila. Skús to, prosím, znova.';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <section class="container-page flex justify-center py-16 sm:py-24">
    <div class="flex w-full max-w-[480px] flex-col gap-6">
      <div class="flex flex-col gap-3">
        <SectionEyebrow line>Môj účet</SectionEyebrow>
        <h1 class="display text-[clamp(2.75rem,6vw,4rem)]">Registrácia</h1>
        <p class="text-ink-muted">
          S účtom máš rezervácie na jednom mieste a údaje sa ti predvyplnia.
        </p>
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
        <FormField
          v-model="form.name"
          label="Meno a priezvisko"
          autocomplete="name"
          :error="shown('name')"
          required
        />
        <FormField
          v-model="form.email"
          label="E-mail"
          type="email"
          autocomplete="email"
          :error="shown('email')"
          required
        />
        <FormField
          v-model="form.phone"
          label="Telefón (nepovinné)"
          type="tel"
          autocomplete="tel"
          placeholder="+421 9xx xxx xxx"
          hint="Predvyplní sa pri rezervácii, príde naň SMS potvrdenie."
          :error="shown('phone')"
        />
        <FormField
          v-model="form.password"
          label="Heslo"
          type="password"
          autocomplete="new-password"
          hint="Aspoň 8 znakov."
          :error="shown('password')"
          required
        />
        <BaseButton type="submit" size="lg" :disabled="pending">
          {{ pending ? 'Vytváram účet…' : 'Vytvoriť účet' }}
        </BaseButton>
        <p class="text-[13px] text-ink-dim">
          Registráciou súhlasíš so spracovaním údajov podľa
          <NuxtLink to="/ochrana-sukromia" class="font-semibold">zásad ochrany súkromia</NuxtLink>.
        </p>
      </form>
      <p class="text-ink-muted">
        Už máš účet?
        <NuxtLink :to="{ path: '/prihlasenie', query: route.query }" class="font-bold"
          >Prihlás sa</NuxtLink
        >
      </p>
    </div>
  </section>
</template>
