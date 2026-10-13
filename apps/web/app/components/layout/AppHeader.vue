<script setup lang="ts">
const booking = useBooking();
const { loggedIn } = useAuth();
const route = useRoute();

const links = [
  { label: 'Služby', to: '/#sluzby' },
  { label: 'Recenzie', to: '/#recenzie' },
  { label: 'Kontakt', to: '/#lokalita' },
];
const accountLink = computed(() =>
  loggedIn.value
    ? { label: 'Môj účet', to: '/moje-rezervacie' }
    : { label: 'Prihlásiť sa', to: '/prihlasenie' },
);

/** Mobilné menu (pod breakpointom md). */
const menuOpen = ref(false);
const toggleButton = ref<HTMLButtonElement>();
const menuPanel = ref<HTMLElement>();

function closeMenu(focusToggle = false) {
  if (!menuOpen.value) return;
  menuOpen.value = false;
  if (focusToggle) toggleButton.value?.focus();
}

function openBooking() {
  closeMenu();
  booking.open();
}

// Po otvorení presuň focus na prvú položku menu (klávesnica, čítačky obrazovky).
watch(menuOpen, async (open) => {
  if (!open) return;
  await nextTick();
  menuPanel.value?.querySelector<HTMLElement>('a, button')?.focus();
});

// Zmena stránky alebo kotvy (napr. /#sluzby) menu zavrie.
watch(
  () => route.fullPath,
  () => closeMenu(),
);

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu(true);
}

let desktopQuery: MediaQueryList | undefined;
const onBreakpoint = (event: MediaQueryListEvent) => event.matches && closeMenu();

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  desktopQuery = window.matchMedia('(min-width: 768px)');
  desktopQuery.addEventListener('change', onBreakpoint);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  desktopQuery?.removeEventListener('change', onBreakpoint);
});

const linkClass = 'py-2.5 text-ink-soft transition-colors hover:text-accent-hover';
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-line bg-canvas/92 backdrop-blur-md">
    <div class="container-page flex items-center justify-between gap-6 py-3.5">
      <NuxtLink
        to="/"
        class="flex min-h-11 items-center gap-2.5 text-ink"
        aria-label="Britva Barber – úvod"
      >
        <AppLogo class="text-accent" />
        <span class="font-display text-[26px] font-extrabold tracking-[0.04em] uppercase"
          >Britva</span
        >
      </NuxtLink>

      <!-- Desktop -->
      <nav
        aria-label="Hlavná navigácia"
        class="hidden items-center gap-x-5.5 text-[15px] font-semibold md:flex"
        data-testid="desktop-nav"
      >
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" :class="linkClass">
          {{ link.label }}
        </NuxtLink>
        <NuxtLink :to="accountLink.to" :class="linkClass">{{ accountLink.label }}</NuxtLink>
        <BaseButton @click="booking.open()">Rezervovať</BaseButton>
      </nav>

      <!-- Mobil: tlačidlo menu -->
      <button
        ref="toggleButton"
        type="button"
        class="-mr-2 flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:text-accent md:hidden"
        :aria-expanded="menuOpen"
        aria-controls="mobile-menu"
        :aria-label="menuOpen ? 'Zavrieť menu' : 'Otvoriť menu'"
        @click="menuOpen = !menuOpen"
      >
        <span class="relative block h-4 w-[22px]" aria-hidden="true">
          <span
            class="absolute left-0 h-0.5 w-full rounded bg-current transition-transform duration-300 ease-out motion-reduce:transition-none"
            :class="menuOpen ? 'top-[7px] rotate-45' : 'top-0'"
          />
          <span
            class="absolute top-[7px] left-0 h-0.5 w-full rounded bg-current transition-opacity duration-200 motion-reduce:transition-none"
            :class="menuOpen ? 'opacity-0' : 'opacity-100'"
          />
          <span
            class="absolute left-0 h-0.5 w-full rounded bg-current transition-transform duration-300 ease-out motion-reduce:transition-none"
            :class="menuOpen ? 'top-[7px] -rotate-45' : 'top-[14px]'"
          />
        </span>
      </button>
    </div>

    <!-- Mobil: vysúvací panel -->
    <Transition
      enter-active-class="transition duration-300 ease-out motion-reduce:transition-none"
      enter-from-class="-translate-y-3 opacity-0"
      leave-active-class="transition duration-200 ease-in motion-reduce:transition-none"
      leave-to-class="-translate-y-3 opacity-0"
    >
      <nav
        v-if="menuOpen"
        id="mobile-menu"
        ref="menuPanel"
        aria-label="Hlavná navigácia"
        class="absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-line bg-canvas shadow-[0_24px_48px_rgba(0,0,0,0.45)] md:hidden"
        data-testid="mobile-nav"
      >
        <ul class="container-page flex flex-col py-3">
          <li
            v-for="(link, index) in [...links, accountLink]"
            :key="link.to"
            class="menu-item border-b border-line"
            :style="{ '--i': index }"
          >
            <NuxtLink
              :to="link.to"
              class="flex min-h-13 items-center font-display text-[28px] font-extrabold tracking-[0.02em] text-ink uppercase transition-colors hover:text-accent"
              @click="closeMenu()"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
          <li class="menu-item pt-5 pb-3" :style="{ '--i': links.length + 1 }">
            <BaseButton size="lg" class="w-full" @click="openBooking">Rezervovať termín</BaseButton>
          </li>
        </ul>
      </nav>
    </Transition>
  </header>

  <!-- Stmavené pozadie pod menu (mimo <header>: backdrop-blur by obmedzil position: fixed) -->
  <Transition
    enter-active-class="transition-opacity duration-300 motion-reduce:transition-none"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200 motion-reduce:transition-none"
    leave-to-class="opacity-0"
  >
    <div
      v-if="menuOpen"
      class="fixed inset-0 z-10 bg-[rgba(8,7,6,0.7)] md:hidden"
      aria-hidden="true"
      data-testid="menu-backdrop"
      @click="closeMenu()"
    />
  </Transition>
</template>

<style scoped>
/* Položky menu sa pri otvorení objavia postupne (malé oneskorenie podľa poradia). */
.menu-item {
  animation: menu-item-in 320ms ease-out both;
  animation-delay: calc(var(--i) * 40ms + 60ms);
}

@keyframes menu-item-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-item {
    animation: none;
  }
}
</style>
