<template>
  <section class="vendor-list">
    <!-- Toolbar: Search + Filters + Add Button -->
    <div class="vendor-list__toolbar">
      <div class="vendor-list__toolbar-left">
        <div class="vendor-list__search">
          <SearchIcon class="vendor-list__search-icon" />
          <label for="vendor-search" class="vendor-list__sr-only">Search vendors</label>
          <input
            id="vendor-search"
            v-model="searchQuery"
            type="text"
            class="vendor-list__search-input"
            placeholder="Search vendors..."
          />
        </div>
        <label for="type-filter" class="vendor-list__sr-only">Filter by partner type</label>
        <BaseSelect
          id="type-filter"
          :model-value="partnerTypeFilter ?? ''"
          :options="PARTNER_TYPES"
          placeholder="All Types"
          @update:model-value="handleFilterChange"
        />
      </div>
      <button class="btn btn--primary vendor-list__add-btn" @click="emit('addVendor')">
        <PlusIcon />
        Add Vendor
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="vendor-list__state">Loading vendors...</div>

    <!-- Error State -->
    <div v-else-if="error" class="vendor-list__state vendor-list__state--error">
      {{ error.message }}
    </div>

    <!-- Empty State -->
    <div v-else-if="hasNoVendors" class="vendor-list__state">
      No vendors found. Add your first vendor!
    </div>

    <!-- No search results -->
    <div v-else-if="hasNoResults" class="vendor-list__state">
      No vendors match your search.
    </div>

    <table v-else class="vendor-table">
      <thead>
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="vendor-table__header"
            :class="[
              header.column.getCanSort() ? 'vendor-table__header--sortable' : '',
              (header.column.columnDef.meta as Record<string, string>)?.class ?? '',
            ]"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            <span v-if="header.column.getIsSorted() === 'asc'" class="vendor-table__sort-indicator" aria-label="Sorted ascending"> &#8593;</span>
            <span v-else-if="header.column.getIsSorted() === 'desc'" class="vendor-table__sort-indicator" aria-label="Sorted descending"> &#8595;</span>
            <span v-else-if="header.column.getCanSort()" class="vendor-table__sort-indicator vendor-table__sort-indicator--idle" aria-label="Sortable"> &#8597;</span>
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
            :class="(cell.column.columnDef.meta as Record<string, string>)?.class ?? ''"
          >
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile Detail Panel -->
    <Teleport to="body">
      <div v-if="selectedVendor" class="vendor-detail-overlay" @click.self="closeDetail">
        <aside class="vendor-detail" role="dialog" aria-label="Vendor details">
          <div class="vendor-detail__header">
            <h3 class="vendor-detail__title">{{ selectedVendor.name }}</h3>
            <button class="btn btn--icon btn--icon-neutral" aria-label="Close details" @click="closeDetail">
              <XIcon />
            </button>
          </div>

          <dl class="vendor-detail__fields">
            <div class="vendor-detail__field">
              <dt class="vendor-detail__label">Contact Person</dt>
              <dd class="vendor-detail__value">{{ selectedVendor.contact_person }}</dd>
            </div>
            <div class="vendor-detail__field">
              <dt class="vendor-detail__label">Email</dt>
              <dd class="vendor-detail__value">{{ selectedVendor.email }}</dd>
            </div>
            <div class="vendor-detail__field">
              <dt class="vendor-detail__label">Partner Type</dt>
              <dd class="vendor-detail__value">
                <span :class="`badge ${selectedVendor.partner_type === 'Partner' ? 'badge--partner' : 'badge--supplier'}`">
                  {{ selectedVendor.partner_type }}
                </span>
              </dd>
            </div>
          </dl>

          <div class="vendor-detail__actions">
            <button class="btn btn--outline vendor-detail__btn" @click="emit('editVendor', selectedVendor!); closeDetail()">
              <PencilIcon />
              Edit
            </button>
            <button class="btn btn--danger vendor-detail__btn" @click="confirmDelete(selectedVendor!); closeDetail()">
              <TrashIcon />
              Delete
            </button>
          </div>
        </aside>
      </div>
    </Teleport>

    <ConfirmDialog
      title="Delete Vendor"
      :open="showDeleteDialog"
      :message="`Are you sure you want to delete '${vendorToDelete?.name}'? This action cannot be undone.`"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import {
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  FlexRender,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table';
import { useVendors } from '../composables/useVendors';
import BaseSelect from './BaseSelect.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import SearchIcon from './icons/SearchIcon.vue';
import PlusIcon from './icons/PlusIcon.vue';
import TrashIcon from './icons/TrashIcon.vue';
import PencilIcon from './icons/PencilIcon.vue';
import EyeIcon from './icons/EyeIcon.vue';
import XIcon from './icons/XIcon.vue';
import { PARTNER_TYPES } from '../types/Vendor';
import type { Vendor, PartnerType } from '../types/Vendor';

const emit = defineEmits<{
  addVendor: [];
  editVendor: [vendor: Vendor];
}>();

const { vendors, isLoading, error, deleteVendor } = useVendors();
const showDeleteDialog = ref(false);
const vendorToDelete = ref<Vendor | null>(null);
const sorting = ref<SortingState>([]);
const searchQuery = ref('');
const partnerTypeFilter = ref<PartnerType | null>(null);

const selectedVendor = ref<Vendor | null>(null);

const hasNoVendors = computed(() => vendors.value.length === 0);
const hasNoResults = computed(() => table.getRowModel().rows.length === 0);

function handleFilterChange(value: string): void {
  partnerTypeFilter.value = value === 'Partner' || value === 'Supplier' ? value : null;
  table.getColumn('partner_type')?.setFilterValue(partnerTypeFilter.value ?? undefined);
}

function openDetail(vendor: Vendor): void {
  selectedVendor.value = vendor;
}

function closeDetail(): void {
  selectedVendor.value = null;
}

function confirmDelete(vendor: Vendor): void {
  vendorToDelete.value = vendor;
  showDeleteDialog.value = true;
}

async function handleDelete(): Promise<void> {
  if (vendorToDelete.value?.id) {
    try {
      await deleteVendor.mutateAsync(vendorToDelete.value.id);
    } catch {
      // Error is handled by TanStack Query
    }
  }
  showDeleteDialog.value = false;
  vendorToDelete.value = null;
}

const columnHelper = createColumnHelper<Vendor>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
  }),
  columnHelper.accessor('contact_person', {
    header: 'Contact Person',
    meta: { class: 'vendor-table__col--contact' },
  }),
  columnHelper.accessor('email', {
    header: 'Email',
  }),
  columnHelper.accessor('partner_type', {
    header: 'Partner Type',
    meta: { class: 'vendor-table__col--type' },
    cell: (info) => {
      const value = info.getValue();
      return h('span', {
        class: `badge ${value === 'Partner' ? 'badge--partner' : 'badge--supplier'}`,
      }, value);
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { class: 'vendor-table__col--actions' },
    cell: (info) =>
      h('div', { class: 'vendor-table__actions' }, [
        h(
          'button',
          {
            class: 'btn btn--icon',
            onClick: () => emit('editVendor', info.row.original),
            'aria-label': `Edit ${info.row.original.name}`,
          },
          [h(PencilIcon)]
        ),
        h(
          'button',
          {
            class: 'btn btn--icon',
            onClick: () => confirmDelete(info.row.original),
            'aria-label': `Delete ${info.row.original.name}`,
          },
          [h(TrashIcon)]
        ),
      ]),
  }),
  columnHelper.display({
    id: 'view',
    header: '',
    enableSorting: false,
    meta: { class: 'vendor-table__col--view' },
    cell: (info) =>
      h(
        'button',
        {
          class: 'btn btn--icon',
          onClick: () => openDetail(info.row.original),
          'aria-label': `View details for ${info.row.original.name}`,
        },
        [h(EyeIcon)]
      ),
  }),
];

const table = useVueTable({
  get data() {
    return vendors.value;
  },
  columns,
  state: {
    get sorting() {
      return sorting.value;
    },
    get globalFilter() {
      return searchQuery.value;
    },
  },
  onSortingChange: (updaterOrValue: Updater<SortingState>) => {
    sorting.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting.value)
        : updaterOrValue;
  },
  onGlobalFilterChange: (updaterOrValue: Updater<string>) => {
    searchQuery.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(searchQuery.value)
        : updaterOrValue;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

</script>

<style scoped>
/* ── Card Container ── */

.vendor-list {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  animation: fade-in 0.3s ease;
  transition: background-color var(--transition-normal);
}

/* ── Screen reader only ── */

.vendor-list__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ── Toolbar ── */

.vendor-list__toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

@media (min-width: 768px) {
  .vendor-list__toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.vendor-list__toolbar-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

@media (min-width: 768px) {
  .vendor-list__toolbar-left {
    flex-direction: row;
    align-items: center;
    width: auto;
  }
}

.vendor-list__search {
  position: relative;
  width: 100%;
}

@media (min-width: 768px) {
  .vendor-list__search {
    max-width: 400px;
  }
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
  padding: 10px var(--spacing-sm) 10px 40px;
  border: 1px solid var(--color-input);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.vendor-list__search-input::placeholder {
  color: var(--color-text-secondary);
}

.vendor-list__search-input:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
  outline: none;
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

/* ── Table ── */

.vendor-table {
  width: 100%;
  border-collapse: collapse;
}

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

.vendor-table__cell {
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.vendor-table__row {
  animation: fade-in-up 0.3s ease both;
  transition: background-color var(--transition-fast);
}

.vendor-table__row:hover {
  background-color: var(--color-background);
}

/* ── FlexRender child content (needs :deep) ── */

:deep(.vendor-table__actions) {
  display: flex;
  gap: var(--spacing-xs);
}

:deep(.vendor-table__col--view) {
  display: none;
}

@media (max-width: 767px) {
  :deep(.vendor-table__col--contact),
  :deep(.vendor-table__col--type),
  :deep(.vendor-table__col--actions) {
    display: none;
  }

  :deep(.vendor-table__col--view) {
    display: table-cell;
  }
}

/* ── Mobile Detail Panel (Teleport preserves scoped attrs) ── */

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

