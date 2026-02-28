<template>
  <dialog ref="dialogRef" class="dialog-base dialog-base--bottom-sheet vendor-form" @cancel.prevent="close">
    <div class="vendor-form__header">
      <h2 class="vendor-form__title">{{ isEditMode ? 'Edit Vendor' : 'Add New Vendor' }}</h2>
      <button class="btn btn--icon btn--icon-neutral" @click="close" aria-label="Close dialog">
        <XIcon />
      </button>
    </div>

    <form class="vendor-form__body" @submit="onSubmit">
      <div class="vendor-form__field">
        <label class="vendor-form__label" for="name">Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          class="input-base vendor-form__input"
          :class="{ 'input-base--invalid': nameError }"
          :aria-invalid="nameError ? 'true' : undefined"
          :aria-describedby="nameError ? 'name-error' : undefined"
          placeholder="Company name"
          @blur="() => validateName()"
        />
        <span v-if="nameError" :id="'name-error'" class="vendor-form__field-error" role="alert">
          {{ nameError }}
        </span>
      </div>

      <div class="vendor-form__field">
        <label class="vendor-form__label" for="contactPerson">Contact Person</label>
        <input
          id="contactPerson"
          v-model="contactPerson"
          type="text"
          class="input-base vendor-form__input"
          :class="{ 'input-base--invalid': contactPersonError }"
          :aria-invalid="contactPersonError ? 'true' : undefined"
          :aria-describedby="contactPersonError ? 'contact-error' : undefined"
          placeholder="Contact person name"
          @blur="() => validateContactPerson()"
        />
        <span v-if="contactPersonError" :id="'contact-error'" class="vendor-form__field-error" role="alert">
          {{ contactPersonError }}
        </span>
      </div>

      <div class="vendor-form__field">
        <label class="vendor-form__label" for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="input-base vendor-form__input"
          :class="{ 'input-base--invalid': emailError || mutationError }"
          :aria-invalid="emailError || mutationError ? 'true' : undefined"
          :aria-describedby="emailError ? 'email-error' : mutationError ? 'form-error' : undefined"
          placeholder="contact@example.com"
          @blur="() => validateEmail()"
        />
        <span v-if="emailError" :id="'email-error'" class="vendor-form__field-error" role="alert">
          {{ emailError }}
        </span>
      </div>

      <div class="vendor-form__field">
        <label class="vendor-form__label" for="partnerType">Partner Type</label>
        <BaseSelect
          id="partnerType"
          :model-value="partnerType"
          :options="PARTNER_TYPES"
          class="vendor-form__input"
          @update:model-value="partnerType = $event as PartnerType /* safe: options are PARTNER_TYPES */"
        />
      </div>

      <div v-if="mutationError" id="form-error" class="vendor-form__error" role="alert">
        {{ mutationError }}
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
import { ref, computed, watch } from 'vue';
import { useForm, useField } from 'vee-validate';
import { useVendors } from '../composables/useVendors';
import BaseSelect from './BaseSelect.vue';
import XIcon from './icons/XIcon.vue';
import { PARTNER_TYPES } from '../types/Vendor';
import type { Vendor, PartnerType } from '../types/Vendor';

const props = defineProps<{
  open: boolean;
  vendor?: Vendor | null;
}>();

const isEditMode = computed(() => !!props.vendor);

const emit = defineEmits<{
  close: [];
}>();

const { createVendor, updateVendor } = useVendors();
const dialogRef = ref<HTMLDialogElement | null>(null);
const isSubmitting = ref(false);
const isBusy = computed(() => isSubmitting.value || createVendor.isPending.value || updateVendor.isPending.value);
const mutationError = computed(() => createVendor.error.value?.message ?? updateVendor.error.value?.message ?? null);
const triggerElement = ref<Element | null>(null);

function requiredValidator(value: unknown): string | true {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return 'This field is required';
  }
  return true;
}

function emailValidator(value: unknown): string | true {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return 'Email is required';
  }
  if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address';
  }
  return true;
}

interface VendorFormValues {
  name: string;
  contact_person: string;
  email: string;
  partner_type: PartnerType;
}

const { handleSubmit, resetForm, setValues } = useForm<VendorFormValues>({
  initialValues: {
    name: '',
    contact_person: '',
    email: '',
    partner_type: 'Supplier',
  },
});

const { value: name, errorMessage: nameError, validate: validateName } = useField<string>('name', requiredValidator);
const { value: contactPerson, errorMessage: contactPersonError, validate: validateContactPerson } = useField<string>('contact_person', requiredValidator);
const { value: email, errorMessage: emailError, validate: validateEmail } = useField<string>('email', emailValidator);
const { value: partnerType } = useField<PartnerType>('partner_type');

function openDialog(): void {
  createVendor.reset();
  updateVendor.reset();
  resetForm();
  if (props.vendor) {
    setValues({
      name: props.vendor.name,
      contact_person: props.vendor.contact_person,
      email: props.vendor.email,
      partner_type: props.vendor.partner_type,
    });
  }
  triggerElement.value = document.activeElement;
  dialogRef.value?.showModal();
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

function close(): void {
  emit('close');
}

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  try {
    const vendor: Vendor = {
      name: values.name,
      contact_person: values.contact_person,
      email: values.email,
      partner_type: values.partner_type,
    };
    if (isEditMode.value && props.vendor?.id) {
      await updateVendor.mutateAsync({ id: props.vendor.id, vendor });
    } else {
      await createVendor.mutateAsync(vendor);
    }
    close();
  } catch {
    // Error is handled by TanStack Query mutation
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<style scoped>
.vendor-form {
  padding: 0;
  max-width: 480px;
  width: 90%;
  animation: scale-in 0.2s ease;
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
  padding: var(--spacing-input-y) var(--spacing-sm);
}

.vendor-form__field-error {
  display: block;
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
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
    max-width: 100%;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    animation: slide-up 0.25s ease;
  }
}
</style>
