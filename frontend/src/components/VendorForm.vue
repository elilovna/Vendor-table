<template>
  <dialog ref="dialogRef" class="vendor-form" @cancel.prevent="close">
    <div class="vendor-form__header">
      <h2 class="vendor-form__title">{{ isEditMode ? 'Edit Vendor' : 'Add New Vendor' }}</h2>
      <button class="btn btn--icon btn--icon-neutral" @click="close" aria-label="Close dialog">
        <XIcon />
      </button>
    </div>

    <form class="vendor-form__body" @submit.prevent="submitForm">
      <div class="vendor-form__field">
        <label class="vendor-form__label" for="name">Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="vendor-form__input"
          required
          placeholder="Company name"
        />
      </div>

      <div class="vendor-form__field">
        <label class="vendor-form__label" for="contactPerson">Contact Person</label>
        <input
          id="contactPerson"
          v-model="form.contact_person"
          type="text"
          class="vendor-form__input"
          required
          placeholder="Contact person name"
        />
      </div>

      <div class="vendor-form__field">
        <label class="vendor-form__label" for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="vendor-form__input"
          :class="{ 'vendor-form__input--invalid': vendorStore.error }"
          :aria-invalid="vendorStore.error ? 'true' : undefined"
          :aria-describedby="vendorStore.error ? 'form-error' : undefined"
          required
          placeholder="contact@example.com"
        />
      </div>

      <div class="vendor-form__field">
        <label class="vendor-form__label" for="partnerType">Partner Type</label>
        <select
          id="partnerType"
          v-model="form.partner_type"
          class="vendor-form__input"
          required
        >
          <option value="Supplier">Supplier</option>
          <option value="Partner">Partner</option>
        </select>
      </div>

      <div v-if="vendorStore.error" id="form-error" class="vendor-form__error" role="alert">
        {{ vendorStore.error }}
      </div>

      <div class="vendor-form__actions">
        <button type="button" class="btn btn--outline" @click="close">Cancel</button>
        <button type="submit" class="btn btn--primary" :disabled="isBusy">
          {{ isBusy ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Vendor') }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, nextTick } from 'vue';
import { useVendorStore } from '../stores/vendorStore';
import XIcon from './icons/XIcon.vue';
import type { Vendor } from '../types/Vendor';

const props = defineProps<{
  open: boolean;
  vendor?: Vendor | null;
}>();

const isEditMode = computed(() => !!props.vendor);

const emit = defineEmits<{
  close: [];
}>();

const vendorStore = useVendorStore();
const dialogRef = ref<HTMLDialogElement | null>(null);
const isSubmitting = ref(false);
const isBusy = computed(() => isSubmitting.value || vendorStore.loading);
const triggerElement = ref<Element | null>(null);

const form = reactive<Vendor>({
  name: '',
  contact_person: '',
  email: '',
  partner_type: 'Supplier'
});

function populateForm(vendor: Vendor): void {
  form.name = vendor.name;
  form.contact_person = vendor.contact_person;
  form.email = vendor.email;
  form.partner_type = vendor.partner_type;
}

async function openDialog(): Promise<void> {
  if (props.vendor) {
    populateForm(props.vendor);
  }
  triggerElement.value = document.activeElement;
  dialogRef.value?.showModal();
  await nextTick();
  dialogRef.value?.querySelector('input')?.focus();
}

function closeDialog(): void {
  dialogRef.value?.close();
  if (triggerElement.value instanceof HTMLElement) {
    triggerElement.value.focus();
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    openDialog();
  } else {
    closeDialog();
  }
});

function resetForm(): void {
  form.name = '';
  form.contact_person = '';
  form.email = '';
  form.partner_type = 'Supplier';
}

function close(): void {
  resetForm();
  emit('close');
}

async function submitForm(): Promise<void> {
  isSubmitting.value = true;
  try {
    if (isEditMode.value && props.vendor?.id) {
      await vendorStore.updateVendor(props.vendor.id, { ...form });
      close();
    } else {
      await vendorStore.addVendor({ ...form });
      close();
    }
  } catch {
    // Error is handled in the store
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.vendor-form {
  border: none;
  border-radius: var(--radius-md);
  padding: 0;
  max-width: 480px;
  width: 90%;
  background-color: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-lg);
  animation: scale-in 0.2s ease;
}

.vendor-form::backdrop {
  background: hsl(0 0% 0% / 0.5);
  animation: fade-in 0.2s ease;
}

/* ── Header ── */

.vendor-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-lg) 0;
}

.vendor-form__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

/* ── Body ── */

.vendor-form__body {
  padding: var(--spacing-lg);
}

.vendor-form__field {
  margin-bottom: var(--spacing-md);
}

.vendor-form__label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

.vendor-form__input {
  width: 100%;
  padding: 10px var(--spacing-sm);
  border: 1px solid var(--color-input);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.vendor-form__input::placeholder {
  color: var(--color-text-secondary);
}

.vendor-form__input:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
  outline: none;
}

.vendor-form__input--invalid {
  border-color: var(--color-danger);
}

.vendor-form__input--invalid:focus-visible {
  box-shadow: 0 0 0 3px hsl(0 72% 50% / 0.15);
}

.vendor-form__error {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

/* ── Actions ── */

.vendor-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

/* ── Mobile: bottom sheet ── */

@media (max-width: 767px) {
  .vendor-form {
    inset: auto 0 0 0;
    margin: auto 0 0 0;
    max-width: 100%;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    animation: slide-up 0.25s ease;
  }
}
</style>
