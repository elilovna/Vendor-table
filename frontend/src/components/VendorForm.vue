<template>
  <dialog ref="dialogRef" class="vendor-form-dialog" @cancel.prevent="close">
    <div class="dialog-header">
      <h2 class="dialog-title">Add New Vendor</h2>
      <button class="dialog-close" @click="close" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Company name"
        />
      </div>

      <div class="form-group">
        <label for="contactPerson">Contact Person</label>
        <input
          id="contactPerson"
          v-model="form.contact_person"
          type="text"
          required
          placeholder="Contact person name"
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="contact@example.com"
        />
      </div>

      <div class="form-group">
        <label for="partnerType">Partner Type</label>
        <select
          id="partnerType"
          v-model="form.partner_type"
          required
        >
          <option value="Supplier">Supplier</option>
          <option value="Partner">Partner</option>
        </select>
      </div>

      <div v-if="vendorStore.error" class="form-error">{{ vendorStore.error }}</div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="close">Cancel</button>
        <button type="submit" class="btn-submit" :disabled="vendorStore.loading">
          {{ vendorStore.loading ? 'Adding...' : 'Add Vendor' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useVendorStore } from '../stores/vendorStore';
import type { Vendor } from '../types/Vendor';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const vendorStore = useVendorStore();
const dialogRef = ref<HTMLDialogElement | null>(null);

const form = reactive<Vendor>({
  name: '',
  contact_person: '',
  email: '',
  partner_type: 'Supplier'
});

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    dialogRef.value?.showModal();
  } else {
    dialogRef.value?.close();
  }
});

function resetForm() {
  form.name = '';
  form.contact_person = '';
  form.email = '';
  form.partner_type = 'Supplier';
}

function close() {
  resetForm();
  emit('close');
}

async function submitForm() {
  try {
    await vendorStore.addVendor({ ...form });
    close();
  } catch {
    // Error is handled in the store
  }
}
</script>

<style scoped>
.vendor-form-dialog {
  border: none;
  border-radius: var(--radius);
  padding: 0;
  max-width: 480px;
  width: 90%;
  background-color: var(--card);
  color: var(--card-foreground);
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.2s ease;
}

.vendor-form-dialog::backdrop {
  background: hsl(0 0% 0% / 0.5);
  animation: fadeIn 0.2s ease;
}

/* ── Header ── */

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--foreground);
  margin: 0;
}

.dialog-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.dialog-close:hover {
  color: var(--foreground);
  background-color: var(--background);
}

/* ── Form ── */

form {
  padding: 20px 24px 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--foreground);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--input);
  border-radius: var(--radius);
  background-color: var(--card);
  color: var(--foreground);
  font-size: 14px;
  font-family: var(--font-sans);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input::placeholder {
  color: var(--muted);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--ring);
  box-shadow: 0 0 0 3px hsl(200 98% 39% / 0.15);
}

.form-error {
  color: var(--destructive);
  font-size: 13px;
  margin-bottom: 12px;
}

/* ── Actions ── */

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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

.btn-submit {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius);
  background-color: var(--primary);
  color: var(--primary-foreground);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:hover {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
