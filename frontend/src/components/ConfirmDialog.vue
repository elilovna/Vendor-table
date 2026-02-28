<template>
  <dialog ref="dialogRef" class="dialog-base dialog-base--bottom-sheet confirm-dialog" @cancel.prevent="cancel">
    <div class="confirm-dialog__icon">
      <AlertCircleIcon />
    </div>
    <h3 class="confirm-dialog__title">{{ title }}</h3>
    <p class="confirm-dialog__message">{{ message }}</p>
    <p v-if="error" class="confirm-dialog__error" role="alert">{{ error }}</p>
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
  error?: string | null;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const triggerElement = ref<Element | null>(null);

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    triggerElement.value = document.activeElement;
    dialogRef.value?.showModal();
  } else {
    dialogRef.value?.close();
    if (triggerElement.value instanceof HTMLElement) {
      triggerElement.value.focus();
    }
    triggerElement.value = null;
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
  padding: var(--spacing-lg);
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: scale-in 0.2s ease;
}

.confirm-dialog__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  background-color: var(--color-danger-subtle);
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

.confirm-dialog__error {
  margin: 0 0 var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  background-color: var(--color-danger-subtle);
  border-radius: var(--radius-sm);
}

.confirm-dialog__actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
}

@media (max-width: 767px) {
  .confirm-dialog {
    max-width: 100%;
    width: 100%;
    animation: slide-up 0.25s ease;
  }
}
</style>
