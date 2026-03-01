<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  FlexRender,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table'
import { useVendors } from '@/composables/useVendors'
import { useTableUrlState } from '@/composables/useTableUrlState'
import { createVendorColumns } from '@/components/Table/vendorColumns'
import BaseSelect from '@/components/BaseSelect.vue'
import SearchIcon from '@/components/Icons/SearchIcon.vue'
import PlusIcon from '@/components/Icons/PlusIcon.vue'
import { PARTNER_TYPES } from '@/types/Vendor'
import type { Vendor, PartnerType } from '@/types/Vendor'

const emit = defineEmits<{
  addVendor: []
  editVendor: [vendor: Vendor]
}>()

const ConfirmDialog = defineAsyncComponent(() => import('@/components/ConfirmDialog.vue'))
const VendorDetailPanel = defineAsyncComponent(() => import('@/components/VendorDetailPanel.vue'))

const { vendors, isLoading, error, deleteVendor } = useVendors()
const { searchQuery, sorting, partnerTypeFilter } = useTableUrlState()
const showDeleteDialog = ref(false)
const vendorToDelete = ref<Vendor | null>(null)
const deleteError = ref<string | null>(null)
const selectedVendor = ref<Vendor | null>(null)

const hasNoVendors = computed(() => vendors.value.length === 0)
const hasNoResults = computed(() => table.getRowModel().rows.length === 0)

function handleFilterChange(value: string): void {
  partnerTypeFilter.value = value ? value as PartnerType : null
}

function confirmDelete(vendor: Vendor): void {
  deleteError.value = null
  vendorToDelete.value = vendor
  showDeleteDialog.value = true
}

function handleDetailEdit(vendor: Vendor): void {
  emit('editVendor', vendor)
  selectedVendor.value = null
}

function handleDetailDelete(vendor: Vendor): void {
  confirmDelete(vendor)
  selectedVendor.value = null
}

function cancelDelete(): void {
  showDeleteDialog.value = false
  deleteError.value = null
  vendorToDelete.value = null
}

async function handleDelete(): Promise<void> {
  if (vendorToDelete.value) {
    try {
      deleteError.value = null
      await deleteVendor.mutateAsync(vendorToDelete.value.id)
      showDeleteDialog.value = false
      vendorToDelete.value = null
    } catch (err: unknown) {
      deleteError.value = err instanceof Error ? err.message : 'Failed to delete vendor. Please try again.'
    }
  }
}

const columns = createVendorColumns({
  onEdit: (vendor) => emit('editVendor', vendor),
  onDelete: (vendor) => confirmDelete(vendor),
  onView: (vendor) => { selectedVendor.value = vendor },
})

const table = useVueTable({
  get data() {
    return vendors.value
  },
  columns,
  state: {
    get sorting() {
      return sorting.value
    },
    get globalFilter() {
      return searchQuery.value
    },
  },
  onSortingChange: (updaterOrValue: Updater<SortingState>) => {
    sorting.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting.value)
        : updaterOrValue
  },
  onGlobalFilterChange: (updaterOrValue: Updater<string>) => {
    searchQuery.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(searchQuery.value)
        : updaterOrValue
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})

watch(partnerTypeFilter, (value) => {
  table.getColumn('partner_type')?.setFilterValue(value ?? undefined)
}, { immediate: true })
</script>

<template>
  <section class="vendor-list">
    <!-- Toolbar: Search + Filters + Add Button -->
    <div class="vendor-list__toolbar">
      <div class="vendor-list__toolbar-left">
        <div class="vendor-list__search">
          <SearchIcon class="vendor-list__search-icon" />
          <label
            for="vendor-search"
            class="sr-only"
          >Search vendors</label>
          <input
            id="vendor-search"
            v-model="searchQuery"
            type="text"
            class="input-base vendor-list__search-input"
            placeholder="Search vendors..."
          >
        </div>
        <label
          for="type-filter"
          class="sr-only"
        >Filter by partner type</label>
        <BaseSelect
          id="type-filter"
          :model-value="partnerTypeFilter ?? ''"
          :options="PARTNER_TYPES"
          placeholder="All Types"
          @update:model-value="handleFilterChange"
        />
      </div>
      <button
        class="btn btn--primary vendor-list__add-btn"
        @click="emit('addVendor')"
      >
        <PlusIcon />
        Add Vendor
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="vendor-list__state"
    >
      Loading vendors...
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="vendor-list__state vendor-list__state--error"
      role="alert"
    >
      {{ error.message }}
    </div>

    <!-- Empty State -->
    <div
      v-else-if="hasNoVendors"
      class="vendor-list__state"
    >
      No vendors found. Add your first vendor!
    </div>

    <!-- No search results -->
    <div
      v-else-if="hasNoResults"
      class="vendor-list__state"
    >
      No vendors match your search.
    </div>

    <table
      v-else
      class="vendor-table"
      aria-label="Registered vendors"
    >
      <thead>
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="vendor-table__header"
            :class="[
              header.column.getCanSort() ? 'vendor-table__header--sortable' : '',
              header.column.columnDef.meta?.class ?? '',
            ]"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <FlexRender
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
            <span
              v-if="header.column.getIsSorted() === 'asc'"
              class="vendor-table__sort-indicator"
              aria-label="Sorted ascending"
            > &#8593;</span>
            <span
              v-else-if="header.column.getIsSorted() === 'desc'"
              class="vendor-table__sort-indicator"
              aria-label="Sorted descending"
            > &#8595;</span>
            <span
              v-else-if="header.column.getCanSort()"
              class="vendor-table__sort-indicator vendor-table__sort-indicator--idle"
              aria-label="Sortable"
            > &#8597;</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          class="vendor-table__row"
        >
          <td
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            class="vendor-table__cell"
            :class="cell.column.columnDef.meta?.class ?? ''"
          >
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <VendorDetailPanel
      :vendor="selectedVendor"
      @close="selectedVendor = null"
      @edit="handleDetailEdit"
      @delete="handleDetailDelete"
    />

    <ConfirmDialog
      title="Delete Vendor"
      :open="showDeleteDialog"
      :loading="deleteVendor.isPending.value"
      :message="`Are you sure you want to delete '${vendorToDelete?.name}'? This action cannot be undone.`"
      :error="deleteError"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>

<style scoped>
/* ── Container ── */

.vendor-list {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  animation: fade-in 0.3s ease;
  transition: background-color var(--transition-normal);
}

/* ── Toolbar ── */

.vendor-list__toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.vendor-list__toolbar-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

.vendor-list__search {
  position: relative;
  width: 100%;
}

.vendor-list__search-icon {
  position: absolute;
  left: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.vendor-list__search-input {
  width: 100%;
  padding: var(--spacing-input-y) var(--spacing-sm) var(--spacing-input-y) 40px;
}

:deep(.base-select) {
  width: 100%;
}

.vendor-list__add-btn {
  white-space: nowrap;
}

.vendor-list__add-btn:active {
  transform: scale(0.98);
}

/* ── State Messages ── */

.vendor-list__state {
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.vendor-list__state--error {
  color: var(--color-danger);
}

/* ── Table Structure ── */

.vendor-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.vendor-table__row {
  animation: fade-in-up 0.3s ease both;
  transition: background-color var(--transition-fast);
}

.vendor-table__row:nth-child(even) {
  background-color: var(--color-surface-alt);
}

.vendor-table__row:hover {
  background-color: var(--color-row-hover);
}

/* ── Table Header ── */

.vendor-table__header {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--color-border);
  user-select: none;
}

.vendor-table__header--sortable {
  cursor: pointer;
}

.vendor-table__header--sortable:hover {
  color: var(--color-text);
}

.vendor-table__sort-indicator {
  color: var(--color-primary);
}

.vendor-table__sort-indicator--idle {
  color: var(--color-text-secondary);
  opacity: 0.4;
  transition: opacity var(--transition-fast);
}

.vendor-table__header--sortable:hover .vendor-table__sort-indicator--idle {
  opacity: 0.8;
}

/* ── Table Cells ── */

.vendor-table__cell {
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.vendor-table__name) {
  font-weight: 600;
}

:deep(.vendor-table__actions) {
  display: flex;
  gap: var(--spacing-xs);
}

/* ── Responsive Column Visibility ── */

:deep(.vendor-table__col--contact),
:deep(.vendor-table__col--type),
:deep(.vendor-table__col--actions) {
  display: none;
}

:deep(.vendor-table__col--view) {
  display: table-cell;
  width: 48px;
  text-align: right;
}

/* ── Desktop (≥ 768px) ── */

@media (min-width: 768px) {
  /* Toolbar */
  .vendor-list__toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .vendor-list__toolbar-left {
    flex-direction: row;
    align-items: center;
    width: auto;
  }

  .vendor-list__search {
    max-width: 25rem;
  }

  :deep(.base-select) {
    width: auto;
    min-width: max-content;
  }

  /* Column visibility */
  :deep(.vendor-table__col--contact),
  :deep(.vendor-table__col--type),
  :deep(.vendor-table__col--actions) {
    display: table-cell;
  }

  :deep(.vendor-table__col--view) {
    display: none;
  }
}
</style>
