<script setup lang="ts">
/** Malý nadpis nad sekciou (uppercase, akcentová farba), voliteľne s čiarou. */
withDefaults(defineProps<{ line?: boolean; as?: string }>(), { as: 'p' });
</script>

<template>
  <component
    :is="as"
    class="flex items-center gap-2.5 text-[13px] font-bold tracking-[0.18em] text-accent uppercase"
  >
    <span v-if="line" class="h-0.5 w-7 bg-accent" aria-hidden="true" />
    <slot />
  </component>
</template>
