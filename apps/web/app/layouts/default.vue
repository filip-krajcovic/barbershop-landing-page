<template>
  <div class="flex min-h-screen flex-col">
    <a
      href="#main"
      class="absolute -left-[9999px] top-0 z-50 bg-accent px-5 py-3 font-bold text-on-accent focus:left-0"
    >
      Preskočiť na obsah
    </a>
    <AppHeader />
    <main id="main" class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
