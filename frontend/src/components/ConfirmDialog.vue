<template>
  <dialog ref="dialogRef" class="confirm-dialog" @cancel.prevent="cancel">
    <div class="confirm-dialog__icon">
      <AlertCircleIcon />
    </div>
    <h3 class="confirm-dialog__title">{{ title }}</h3>
    <p class="confirm-dialog__message">{{ message }}</p>
    <div class="confirm-dialog__actions">
      <button class="btn btn--outline" @click="cancel">Cancel</button>
      <button class="btn btn--danger" @click="confirm">Delete</button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import AlertCircleIcon from './icons/AlertCircleIcon.vue';

const props = defineProps<{
  open: boolean;
  title: string;
  message: string;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    dialogRef.value?.showModal();
  } else {
    dialogRef.value?.close();
  }
});

function confirm(): void {
  emit('confirm');
}

function cancel(): void {
  emit('cancel');
}
</script>

<style scoped>
.confirm-dialog {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  max-width: 400px;
  width: 90%;
  background-color: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-lg);
  text-align: center;
  animation: scale-in 0.2s ease;
}

.confirm-dialog::backdrop {
  background: hsl(0 0% 0% / 0.5);
  animation: fade-in 0.2s ease;
}

.confirm-dialog__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  background-color: hsl(0 72% 50% / 0.1);
  color: var(--color-danger);
}

.confirm-dialog__title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.confirm-dialog__message {
  margin: 0 0 var(--spacing-lg);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.confirm-dialog__actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
}

/* ── Mobile: bottom sheet ── */

@media (max-width: 767px) {
  .confirm-dialog {
    inset: auto 0 0 0;
    margin: auto 0 0 0;
    max-width: 100%;
    width: 100%;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    animation: slide-up 0.25s ease;
  }
}
</style>
