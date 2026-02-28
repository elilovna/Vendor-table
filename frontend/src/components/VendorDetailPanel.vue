<template>
  <Teleport to="body">
    <div v-if="vendor" class="vendor-detail-overlay" @click.self="emit('close')">
      <aside class="vendor-detail" role="dialog" aria-label="Vendor details">
        <div class="vendor-detail__header">
          <h3 class="vendor-detail__title">{{ vendor.name }}</h3>
          <button class="btn btn--icon btn--icon-neutral" aria-label="Close details" @click="emit('close')">
            <XIcon />
          </button>
        </div>

        <dl class="vendor-detail__fields">
          <div class="vendor-detail__field">
            <dt class="vendor-detail__label">Contact Person</dt>
            <dd class="vendor-detail__value">{{ vendor.contact_person }}</dd>
          </div>
          <div class="vendor-detail__field">
            <dt class="vendor-detail__label">Email</dt>
            <dd class="vendor-detail__value">{{ vendor.email }}</dd>
          </div>
          <div class="vendor-detail__field">
            <dt class="vendor-detail__label">Partner Type</dt>
            <dd class="vendor-detail__value">
              <span :class="`badge ${vendor.partner_type === 'Partner' ? 'badge--partner' : 'badge--supplier'}`">
                {{ vendor.partner_type }}
              </span>
            </dd>
          </div>
        </dl>

        <div class="vendor-detail__actions">
          <button class="btn btn--outline vendor-detail__btn" @click="emit('edit', vendor)">
            <PencilIcon />
            Edit
          </button>
          <button class="btn btn--danger vendor-detail__btn" @click="emit('delete', vendor)">
            <TrashIcon />
            Delete
          </button>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import XIcon from './icons/XIcon.vue'
import PencilIcon from './icons/PencilIcon.vue'
import TrashIcon from './icons/TrashIcon.vue'
import type { Vendor } from '../types/Vendor'

defineProps<{
  vendor: Vendor | null
}>()

const emit = defineEmits<{
  close: []
  edit: [vendor: Vendor]
  delete: [vendor: Vendor]
}>()
</script>

<style scoped>
.vendor-detail-overlay {
  position: fixed;
  inset: 0;
  background: hsl(0 0% 0% / 0.5);
  z-index: 100;
  animation: fade-in 0.2s ease;
}

.vendor-detail {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 70vh;
  overflow-y: auto;
  background-color: var(--color-surface);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-lg);
  animation: slide-up 0.25s ease;
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
