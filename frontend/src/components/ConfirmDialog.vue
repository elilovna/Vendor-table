<script setup lang="ts">
import AlertCircleIcon from './Icons/AlertCircleIcon.vue';
import { useDialog } from '../composables/useDialog';

const props = defineProps<{
  open: boolean;
  title: string;
  message: string;
  error?: string | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const { dialogRef } = useDialog(() => props.open);

function confirm(): void {
  emit('confirm');
}

function cancel(): void {
  emit('cancel');
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="dialog-base dialog-base--bottom-sheet confirm-dialog"
    @cancel.prevent="cancel"
  >
    <div class="confirm-dialog__icon">
      <AlertCircleIcon />
    </div>
    <h3 class="confirm-dialog__title">
      {{ title }}
    </h3>
    <p class="confirm-dialog__message">
      {{ message }}
    </p>
    <p
      v-if="error"
      class="confirm-dialog__error"
      role="alert"
    >
      {{ error }}
    </p>
    <div class="confirm-dialog__actions">
      <button
        class="btn btn--outline"
        @click="cancel"
      >
        Cancel
      </button>
      <button
        class="btn btn--danger"
        :disabled="loading"
        @click="confirm"
      >
        {{ loading ? 'Deleting...' : 'Delete' }}
      </button>
    </div>
  </dialog>
</template>

<style scoped>
.confirm-dialog {
  padding: var(--spacing-lg);
  max-width: 100%;
  width: 100%;
  text-align: center;
  animation: slide-up 0.2s ease;
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

@media (min-width: 768px) {
  .confirm-dialog {
    max-width: 25rem;
    width: 90%;
    animation: scale-in 0.2s ease;
  }
}
</style>
