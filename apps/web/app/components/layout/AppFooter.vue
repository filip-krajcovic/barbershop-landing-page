<script setup lang="ts">
import { site } from '~/data/site';

const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-line text-sm text-ink-faint">
    <div class="container-page flex flex-wrap items-center justify-between gap-4 py-9">
      <p class="flex flex-wrap items-center gap-x-2.5">
        <span class="font-display text-[22px] font-extrabold tracking-[0.04em] text-ink uppercase">
          Britva
        </span>
        <span>© {{ year }} {{ site.company }}</span>
      </p>
      <nav aria-label="Sociálne siete a právne informácie" class="flex flex-wrap gap-5">
        <a
          v-for="item in site.social"
          :key="item.href"
          :href="item.href"
          target="_blank"
          rel="noopener"
          class="py-2.5 text-ink-soft hover:text-accent-hover"
        >
          {{ item.label }}
        </a>
        <NuxtLink to="/ochrana-sukromia" class="py-2.5 text-ink-soft hover:text-accent-hover">
          Ochrana súkromia
        </NuxtLink>
      </nav>
    </div>
  </footer>
</template>
