<script setup lang="ts">
import ChevronDownIcon from './Icons/ChevronDownIcon.vue';

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

<template>
  <div class="base-select">
    <select
      :id="id"
      class="input-base base-select__native"
      :class="{ 'base-select__native--placeholder': modelValue === '' }"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option
        v-if="placeholder"
        value=""
      >
        {{ placeholder }}
      </option>
      <option
        v-for="opt in options"
        :key="opt"
        :value="opt"
      >
        {{ opt }}
      </option>
    </select>
    <ChevronDownIcon class="base-select__icon" />
  </div>
</template>

<style scoped>
.base-select {
  position: relative;
  display: inline-block;
}

.base-select__native {
  appearance: none;
  padding: var(--spacing-input-y) calc(var(--spacing-md) + 20px) var(--spacing-input-y) var(--spacing-md);
  width: 100%;
  cursor: pointer;
}

.base-select__native--placeholder {
  color: var(--color-text-secondary);
}

.base-select__icon {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  pointer-events: none;
}
</style>
