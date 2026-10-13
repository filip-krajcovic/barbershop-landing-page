<script setup lang="ts">
import { mapsLinks, site } from '~/data/site';

const gps = `${site.geo.lat.toFixed(6)}° N, ${site.geo.lng.toFixed(6)}° E`;
const coords = `${site.geo.lat.toFixed(6)}, ${site.geo.lng.toFixed(6)}`;
</script>

<template>
  <section
    id="lokalita"
    class="container-page flex flex-wrap items-stretch gap-8 py-16 sm:py-24"
    aria-labelledby="lokalita-title"
  >
    <div class="flex min-w-0 flex-[1_1_320px] flex-col gap-6.5">
      <div class="flex flex-col gap-3">
        <SectionEyebrow>Kde nás nájdeš</SectionEyebrow>
        <h2 id="lokalita-title" class="display text-[clamp(2.75rem,6vw,4.5rem)]">
          Centrum<br />Trnavy
        </h2>
      </div>
      <address class="flex flex-col gap-4.5 not-italic">
        <IconInfoItem
          icon="pin"
          :title="`${site.address.street}, ${site.address.city}`"
          :subtitle="site.address.note"
        />
        <IconInfoItem icon="globe" :title="gps" subtitle="GPS súradnice pre navigáciu" />
        <IconInfoItem icon="call" subtitle="volaj alebo píš na WhatsApp">
          <a
            :href="site.phone.href"
            class="inline-flex min-h-11 items-center text-ink hover:text-accent-hover"
          >
            {{ site.phone.display }}
          </a>
        </IconInfoItem>
        <IconInfoItem icon="lock" title="Parkovanie" :subtitle="site.parking" />
      </address>
      <div class="flex flex-wrap gap-3">
        <BaseButton :href="mapsLinks.directions" new-tab>Navigovať</BaseButton>
        <BaseButton :href="mapsLinks.search" new-tab variant="ghost"
          >Otvoriť v Google Maps</BaseButton
        >
      </div>
    </div>

    <a
      :href="mapsLinks.search"
      target="_blank"
      rel="noopener"
      :aria-label="`Otvoriť polohu ${site.name} v Google Maps (${coords})`"
      class="group relative block min-h-[360px] min-w-0 flex-[999_1_560px] overflow-hidden rounded-panel border border-line bg-[#1b1916] sm:min-h-[440px]"
    >
      <!-- Ilustračná mapa okolia (nie skutočná mapa) -->
      <svg
        viewBox="0 0 720 480"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        class="absolute inset-0 size-full"
      >
        <rect width="720" height="480" fill="#1b1916" />
        <g fill="#23211d">
          <rect x="20" y="20" width="150" height="110" rx="6" />
          <rect x="200" y="20" width="170" height="110" rx="6" />
          <rect x="400" y="20" width="130" height="110" rx="6" />
          <rect x="560" y="20" width="150" height="110" rx="6" />
          <rect x="20" y="170" width="150" height="120" rx="6" />
          <rect x="400" y="170" width="130" height="120" rx="6" />
          <rect x="560" y="170" width="150" height="120" rx="6" />
          <rect x="20" y="330" width="150" height="130" rx="6" />
          <rect x="200" y="330" width="170" height="130" rx="6" />
          <rect x="400" y="330" width="130" height="130" rx="6" />
        </g>
        <rect x="200" y="170" width="170" height="120" rx="6" fill="#262c22" />
        <circle cx="285" cy="230" r="22" fill="none" stroke="#3a4433" stroke-width="2" />
        <rect x="560" y="330" width="150" height="130" rx="6" fill="#262c22" />
        <g stroke="#34312b" stroke-width="22" stroke-linecap="round">
          <path d="M0 150H720" />
          <path d="M0 310H720" />
          <path d="M185 0V480" />
          <path d="M545 0V480" />
        </g>
        <path d="M385 0V480" stroke="#4a443a" stroke-width="28" />
        <path d="M385 0V480" stroke="#5a5244" stroke-width="2" stroke-dasharray="10 12" />
        <g
          font-family="Manrope Variable, sans-serif"
          font-size="13"
          font-weight="600"
          fill="#8f877b"
        >
          <text x="395" y="470" transform="rotate(-90 395 470)" fill="#a39a8c">Hlavná</text>
          <text x="40" y="146">Štefánikova</text>
          <text x="560" y="306">Kollárova</text>
          <text x="222" y="275" fill="#7d8a70">Trojičné nám.</text>
          <text x="592" y="400" fill="#7d8a70">Park</text>
        </g>
        <circle cx="470" cy="150" r="46" fill="#d9a54c" opacity="0.12" />
        <circle cx="470" cy="150" r="24" fill="#d9a54c" opacity="0.22" />
        <path d="M470 146c-14-16-22-27-22-38a22 22 0 0 1 44 0c0 11-8 22-22 38z" fill="#d9a54c" />
        <circle cx="470" cy="108" r="8" fill="#15130f" />
      </svg>
      <span
        class="absolute inset-x-5 bottom-5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-line-soft bg-canvas/95 px-5 py-4"
      >
        <span class="flex flex-col">
          <span class="font-bold text-ink">{{ site.name }}</span>
          <span class="text-sm text-ink-dim tabular-nums">{{ coords }}</span>
        </span>
        <span
          class="flex items-center gap-2 text-[15px] font-bold text-accent group-hover:text-accent-hover"
        >
          Klikni a otvor v Google Maps
          <AppIcon name="arrow-up-right" :size="18" :stroke-width="2.2" />
        </span>
      </span>
    </a>
  </section>
</template>
