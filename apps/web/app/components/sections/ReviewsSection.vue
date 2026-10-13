<script setup lang="ts">
import { reviews } from '~/data/reviews';
import { mapsLinks, site } from '~/data/site';
</script>

<template>
  <section id="recenzie" class="border-y border-line bg-raised" aria-labelledby="recenzie-title">
    <div class="container-page flex flex-col gap-10 py-16 sm:py-24">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div class="flex flex-col gap-3">
          <SectionEyebrow>Overené na Google</SectionEyebrow>
          <h2 id="recenzie-title" class="display text-[clamp(2.75rem,6vw,4.5rem)]">
            Recenzie zákazníkov
          </h2>
        </div>
        <div
          class="flex items-center gap-4.5 rounded-[18px] border border-line bg-canvas px-5.5 py-4"
        >
          <p class="font-display text-[56px] leading-none font-black">
            {{ site.rating.value.toLocaleString('sk-SK') }}
          </p>
          <div class="flex flex-col gap-1">
            <StarRating :value="site.rating.value" />
            <p class="text-sm text-ink-dim">{{ site.rating.count }} hodnotení na Google</p>
          </div>
        </div>
      </div>

      <ul class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
        <li v-for="review in reviews" :key="review.name">
          <figure
            class="flex h-full flex-col gap-4 rounded-card border border-line bg-canvas p-6.5"
          >
            <StarRating :value="review.stars" :size="16" />
            <blockquote class="flex-1 text-[#d9d1c5]">„{{ review.text }}“</blockquote>
            <figcaption class="flex items-center gap-3">
              <span
                class="flex size-10 items-center justify-center rounded-full bg-[#2c2925] font-extrabold text-accent"
                aria-hidden="true"
              >
                {{ review.name.charAt(0) }}
              </span>
              <span class="flex flex-col">
                <span class="font-bold">{{ review.name }}</span>
                <span class="text-[13px] text-ink-faint">{{ review.when }} · Google</span>
              </span>
            </figcaption>
          </figure>
        </li>
      </ul>

      <BaseButton variant="link" :href="mapsLinks.search" new-tab class="self-start">
        Všetky recenzie na Google Maps →
      </BaseButton>
    </div>
  </section>
</template>
