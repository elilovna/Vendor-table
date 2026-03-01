<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import VendorList from '@/components/Table/VendorList.vue';
import SunIcon from '@/components/Icons/SunIcon.vue';
import MoonIcon from '@/components/Icons/MoonIcon.vue';
import { useDarkMode } from '@/composables/useDarkMode';
import type { Vendor } from '@/types/Vendor';

const VendorForm = defineAsyncComponent(() => import('@/components/VendorForm.vue'));

const { isDark, toggle } = useDarkMode();
const showVendorForm = ref(false);
const vendorToEdit = ref<Vendor | null>(null);

function openAddForm(): void {
  vendorToEdit.value = null;
  showVendorForm.value = true;
}

function openEditForm(vendor: Vendor): void {
  vendorToEdit.value = vendor;
  showVendorForm.value = true;
}

function closeForm(): void {
  showVendorForm.value = false;
  vendorToEdit.value = null;
}
</script>

<template>
  <div class="app">
    <header class="app__header">
      <div class="app__header-content">
        <div class="app__brand">
          <div class="app__logo">
            V
          </div>
          <h1 class="app__title">
            Vendor Management
          </h1>
        </div>
        <button
          class="app__theme-toggle"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggle"
        >
          <SunIcon v-if="isDark" />
          <MoonIcon v-else />
        </button>
      </div>
    </header>

    <main class="app__main">
      <VendorList
        @add-vendor="openAddForm"
        @edit-vendor="openEditForm"
      />
    </main>

    <VendorForm
      :open="showVendorForm"
      :vendor="vendorToEdit"
      @close="closeForm"
    />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ── Header ── */

.app__header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-normal);
}

.app__header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  padding: var(--spacing-sm) var(--spacing-lg);
  width: 100%;
  max-width: 1400px;
}

.app__brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.app__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-primary-foreground);
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
}

.app__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.app__theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
  cursor: pointer;
}

.app__theme-toggle:hover {
  background-color: var(--color-background);
  border-color: var(--color-text-secondary);
}

/* ── Main ── */

.app__main {
  flex: 1;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
  width: 100%;
  max-width: 1400px;
}

@media (min-width: 768px) {
  .app__main {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }
}
</style>
