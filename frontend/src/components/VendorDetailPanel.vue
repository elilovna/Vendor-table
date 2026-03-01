<script setup lang="ts">
import XIcon from './Icons/XIcon.vue'
import PencilIcon from './Icons/PencilIcon.vue'
import TrashIcon from './Icons/TrashIcon.vue'
import type { Vendor } from '../types/Vendor'
import { useDialog } from '../composables/useDialog'

const props = defineProps<{
  vendor: Vendor | null
}>()

const emit = defineEmits<{
  close: []
  edit: [vendor: Vendor]
  delete: [vendor: Vendor]
}>()

const { dialogRef } = useDialog(() => !!props.vendor)
</script>

<template>
  <dialog
    ref="dialogRef"
    class="dialog-base vendor-detail"
    @cancel.prevent="emit('close')"
  >
    <div class="vendor-detail__header">
      <h3 class="vendor-detail__title">
        {{ vendor?.name }}
      </h3>
      <button
        class="btn btn--icon btn--icon-neutral"
        aria-label="Close details"
        @click="emit('close')"
      >
        <XIcon />
      </button>
    </div>

    <dl class="vendor-detail__fields">
      <div class="vendor-detail__field">
        <dt class="vendor-detail__label">
          Contact Person
        </dt>
        <dd class="vendor-detail__value">
          {{ vendor?.contact_person }}
        </dd>
      </div>
      <div class="vendor-detail__field">
        <dt class="vendor-detail__label">
          Email
        </dt>
        <dd class="vendor-detail__value">
          {{ vendor?.email }}
        </dd>
      </div>
      <div class="vendor-detail__field">
        <dt class="vendor-detail__label">
          Partner Type
        </dt>
        <dd class="vendor-detail__value">
          <span
            v-if="vendor"
            :class="`badge ${vendor.partner_type === 'Partner' ? 'badge--partner' : 'badge--supplier'}`"
          >
            {{ vendor.partner_type }}
          </span>
        </dd>
      </div>
    </dl>

    <div class="vendor-detail__actions">
      <button
        class="btn btn--outline vendor-detail__btn"
        @click="vendor && emit('edit', vendor)"
      >
        <PencilIcon />
        Edit
      </button>
      <button
        class="btn btn--danger vendor-detail__btn"
        @click="vendor && emit('delete', vendor)"
      >
        <TrashIcon />
        Delete
      </button>
    </div>
  </dialog>
</template>

<style scoped>
.vendor-detail {
  padding: var(--spacing-lg);
  animation: slide-up 0.25s ease;
  max-height: 70vh;
  overflow-y: auto;
  inset: auto 0 0 0;
  margin: auto 0 0 0;
  max-width: 100%;
  width: 100%;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.vendor-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.vendor-detail__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.vendor-detail__fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: 0;
}

.vendor-detail__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.vendor-detail__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.vendor-detail__value {
  font-size: var(--font-size-base);
  color: var(--color-text);
  margin: 0;
}

.vendor-detail__actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.vendor-detail__btn {
  flex: 1;
}
</style>
