<script setup lang="ts">
/** Pole formulára s popisom a chybou (prepojené cez aria-describedby). */
const props = defineProps<{
  label: string;
  type?: string;
  autocomplete?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}>();
const model = defineModel<string>({ required: true });
const id = useId();
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-sm font-semibold text-ink-soft">{{ props.label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="props.type ?? 'text'"
      :autocomplete="props.autocomplete"
      :placeholder="props.placeholder"
      :required="props.required"
      :aria-invalid="!!props.error"
      :aria-describedby="props.error || props.hint ? `${id}-desc` : undefined"
      class="min-h-12.5 rounded-xl border bg-surface-2 px-4 text-base font-medium text-ink placeholder:text-[#7d766c] focus:border-accent focus:outline-none"
      :class="props.error ? 'border-red-400' : 'border-line-strong'"
    />
    <span
      v-if="props.error || props.hint"
      :id="`${id}-desc`"
      class="text-[13px]"
      :class="props.error ? 'text-red-300' : 'text-ink-dim'"
    >
      {{ props.error || props.hint }}
    </span>
  </div>
</template>
