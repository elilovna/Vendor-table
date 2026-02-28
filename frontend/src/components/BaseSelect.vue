<template>
  <select
    :id="id"
    class="base-select"
    :class="{ 'base-select--placeholder': modelValue === '' }"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="placeholder" value="">{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
  </select>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  options: readonly string[];
  id?: string;
  placeholder?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<style scoped>
.base-select {
  appearance: none;
  padding: 10px calc(var(--spacing-md) + 20px) 10px var(--spacing-md);
  border: 1px solid var(--color-input);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-sm) center;
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  cursor: pointer;
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.base-select--placeholder {
  color: var(--color-text-secondary);
}

.base-select:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
  outline: none;
}
</style>
