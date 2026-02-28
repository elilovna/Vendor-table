<script setup lang="ts">
import { ref } from 'vue';
import VendorForm from './components/VendorForm.vue';
import VendorList from './components/table/VendorList.vue';
import SunIcon from './components/icons/SunIcon.vue';
import MoonIcon from './components/icons/MoonIcon.vue';
import { useDarkMode } from './composables/useDarkMode';
import type { Vendor } from './types/Vendor';

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
      <div class="app__brand">
        <div class="app__logo">V</div>
        <h1 class="app__title">Vendor Management</h1>
      </div>
      <button
        class="app__theme-toggle"
        @click="toggle"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <SunIcon v-if="isDark" />
        <MoonIcon v-else />
      </button>
    </header>

    <main class="app__main">
      <VendorList @add-vendor="openAddForm" @edit-vendor="openEditForm" />
    </main>

    <VendorForm :open="showVendorForm" :vendor="vendorToEdit" @close="closeForm" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */

.app__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-normal);
}

.app__brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.app__logo {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--font-size-base);
}

.app__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.app__theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.app__theme-toggle:hover {
  background-color: var(--color-background);
  border-color: var(--color-text-secondary);
}

/* ── Main ── */

.app__main {
  flex: 1;
  padding: var(--spacing-xl) var(--spacing-lg);
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .app__main {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }
}
</style>
