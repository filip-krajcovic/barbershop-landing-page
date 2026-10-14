<script setup lang="ts">
const { public: config } = useRuntimeConfig();
const auth = useAuth();

// Session raz pri štarte (na serveri s cookie z prehliadača), aby hlavička vedela, kto je prihlásený.
await callOnce('auth-session', () => auth.ensureLoaded());

useSeoMeta({
  title: 'Pánske strihy, brada a holenie britvou',
  description:
    'Britva Barber v centre Trnavy – klasické pánske strihy, fade, úprava brady a holenie britvou. Rezervuj si termín online.',
  ogType: 'website',
  ogSiteName: 'Britva Barber',
  ogLocale: 'sk_SK',
  ogUrl: config.siteUrl,
});
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>
