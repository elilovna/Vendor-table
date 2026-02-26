<template>
  <section class="vendor-list">
    <!-- Toolbar: Search + Add Button -->
    <div class="vendor-list__toolbar">
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
      <button class="vendor-list__add-btn" @click="emit('addVendor')">
        <PlusIcon />
        Add Vendor
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="vendorStore.loading" class="vendor-list__state">Loading vendors...</div>

    <!-- Error State -->
    <div v-else-if="vendorStore.error" class="vendor-list__state vendor-list__state--error">
      {{ vendorStore.error }}
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
            :class="{ 'vendor-table__header--sortable': header.column.getCanSort() }"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            <span v-if="header.column.getIsSorted() === 'asc'" class="vendor-table__sort-indicator"> &#8593;</span>
            <span v-else-if="header.column.getIsSorted() === 'desc'" class="vendor-table__sort-indicator"> &#8595;</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          class="vendor-table__row"
        >
          <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="vendor-table__cell">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </td>
        </tr>
      </tbody>
    </table>

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
import { ref, computed, onMounted, h } from 'vue';
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
import { useVendorStore } from '../stores/vendorStore';
import ConfirmDialog from './ConfirmDialog.vue';
import SearchIcon from './icons/SearchIcon.vue';
import PlusIcon from './icons/PlusIcon.vue';
import TrashIcon from './icons/TrashIcon.vue';
import PencilIcon from './icons/PencilIcon.vue';
import type { Vendor } from '../types/Vendor';

const emit = defineEmits<{
  addVendor: [];
  editVendor: [vendor: Vendor];
}>();

const vendorStore = useVendorStore();
const showDeleteDialog = ref(false);
const vendorToDelete = ref<Vendor | null>(null);
const sorting = ref<SortingState>([]);
const searchQuery = ref('');

const hasNoVendors = computed(() => vendorStore.vendors.length === 0);
const hasNoResults = computed(() => table.getRowModel().rows.length === 0);

function confirmDelete(vendor: Vendor): void {
  vendorToDelete.value = vendor;
  showDeleteDialog.value = true;
}

async function handleDelete(): Promise<void> {
  if (vendorToDelete.value?.id) {
    try {
      await vendorStore.deleteVendor(vendorToDelete.value.id);
    } catch {
      // Error is handled in the store
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
  }),
  columnHelper.accessor('email', {
    header: 'Email',
  }),
  columnHelper.accessor('partner_type', {
    header: 'Partner Type',
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
    cell: (info) =>
      h('div', { class: 'vendor-table__actions' }, [
        h(
          'button',
          {
            class: 'vendor-table__action-btn',
            onClick: () => emit('editVendor', info.row.original),
            'aria-label': `Edit ${info.row.original.name}`,
          },
          [h(PencilIcon)]
        ),
        h(
          'button',
          {
            class: 'vendor-table__action-btn',
            onClick: () => confirmDelete(info.row.original),
            'aria-label': `Delete ${info.row.original.name}`,
          },
          [h(TrashIcon)]
        ),
      ]),
  }),
];

const table = useVueTable({
  get data() {
    return vendorStore.vendors;
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

onMounted(() => {
  vendorStore.fetchVendors();
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
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 10px var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  font-size: var(--font-size-base);
  font-weight: 600;
  font-family: var(--font-family-base);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color var(--transition-fast), transform 0.1s;
}

.vendor-list__add-btn:hover {
  background-color: var(--color-primary-hover);
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

/* ── Badges ── */

.badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
}

.badge--partner {
  background-color: var(--color-secondary);
  color: var(--color-secondary-foreground);
}

.badge--supplier {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-text);
}


/* ── Responsive ── */

@media (max-width: 640px) {
  .vendor-table__header,
  .vendor-table__cell {
    padding: var(--spacing-sm) var(--spacing-xs);
    font-size: var(--font-size-sm);
  }
}
</style>

<style>
.vendor-table__actions {
  display: flex;
  gap: var(--spacing-xs);
}

.vendor-table__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.vendor-table__action-btn:hover {
  color: var(--color-danger);
  background-color: hsl(0 72% 50% / 0.1);
}
</style>
