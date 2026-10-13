<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

/**
 * Tlačidlo alebo odkaz v štýle dizajnu.
 * S `to` je to NuxtLink, s `href` odkaz (externý s `newTab`), inak `<button>`.
 */
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'link';
    size?: 'md' | 'lg';
    to?: RouteLocationRaw;
    href?: string;
    newTab?: boolean;
    type?: 'button' | 'submit';
    disabled?: boolean;
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
);

const variants = {
  primary: 'rounded-full bg-accent text-on-accent hover:bg-accent-hover',
  ghost: 'rounded-full border border-line-strong font-semibold text-ink hover:border-accent',
  link: 'text-accent hover:text-accent-hover',
} as const;

const sizes = {
  md: 'px-5 py-2.5 text-[15px]',
  lg: 'min-h-13 px-7 py-3.5 text-base',
} as const;

const classes = computed(() => [
  'inline-flex min-h-11 items-center justify-center gap-2 font-bold transition-colors',
  'disabled:cursor-not-allowed disabled:opacity-50',
  variants[props.variant],
  props.variant === 'link' ? 'py-2.5' : sizes[props.size],
]);
</script>

<template>
  <NuxtLink
    v-if="props.to || props.href"
    :to="props.to ?? props.href"
    :target="props.newTab ? '_blank' : undefined"
    :rel="props.newTab ? 'noopener' : undefined"
    :class="classes"
  >
    <slot />
  </NuxtLink>
  <button v-else :type="props.type" :disabled="props.disabled" :class="classes">
    <slot />
  </button>
</template>
