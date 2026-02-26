<template>
  <dialog ref="dialogRef" class="confirm-dialog" @cancel.prevent="cancel">
    <div class="dialog-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <h3 class="dialog-title">{{ title }}</h3>
    <p class="dialog-message">{{ message }}</p>
    <div class="dialog-actions">
      <button class="btn-cancel" @click="cancel">Cancel</button>
      <button class="btn-confirm" @click="confirm">Delete</button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

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

function confirm() {
  emit('confirm');
}

function cancel() {
  emit('cancel');
}
</script>

<style scoped>
.confirm-dialog {
  border: none;
  border-radius: var(--radius);
  padding: 24px;
  max-width: 400px;
  width: 90%;
  background-color: var(--card);
  color: var(--card-foreground);
  box-shadow: var(--shadow-lg);
  text-align: center;
  animation: scaleIn 0.2s ease;
}

.confirm-dialog::backdrop {
  background: hsl(0 0% 0% / 0.5);
  animation: fadeIn 0.2s ease;
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background-color: hsl(0 72% 50% / 0.1);
  color: var(--destructive);
}

.dialog-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--foreground);
}

.dialog-message {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background-color: var(--card);
  color: var(--foreground);
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: var(--background);
}

.btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius);
  background-color: var(--destructive);
  color: var(--destructive-foreground);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-confirm:hover {
  opacity: 0.9;
}
</style>
