import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  // Komponenty bez prefixu podľa priečinka: <BaseButton>, nie <UiBaseButton>.
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      /** Základná URL API bez `/api` (NUXT_PUBLIC_API_URL). */
      apiUrl: 'http://localhost:3001',
      /** Verejná URL webu pre kanonické odkazy a Open Graph (NUXT_PUBLIC_SITE_URL). */
      siteUrl: 'http://localhost:3000',
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'sk' },
      titleTemplate: '%s · Britva Barber Trnava',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#121110' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  typescript: {
    strict: true,
  },
});
