<template>
  <div class="vendor-card">
    <!-- Toolbar: Search + Add Button -->
    <div class="toolbar">
      <div class="search-wrapper">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search vendors..."
        />
      </div>
      <button class="btn-add" @click="$emit('addVendor')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Vendor
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="vendorStore.loading" class="state-message">Loading vendors...</div>

    <!-- Error State -->
    <div v-else-if="vendorStore.error" class="state-message error">{{ vendorStore.error }}</div>

    <!-- Empty State -->
    <div v-else-if="vendorStore.vendors.length === 0" class="state-message">
      No vendors found. Add your first vendor!
    </div>

    <!-- No search results -->
    <div v-else-if="table.getRowModel().rows.length === 0" class="state-message">
      No vendors match your search.
    </div>

    <!-- Table -->
    <table v-else class="vendors-table">
      <thead>
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :class="{ sortable: header.column.getCanSort() }"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            <span v-if="header.column.getIsSorted() === 'asc'" class="sort-indicator"> &#8593;</span>
            <span v-else-if="header.column.getIsSorted() === 'desc'" class="sort-indicator"> &#8595;</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in table.getRowModel().rows"
          :key="row.id"
          class="table-row"
          :style="{ animationDelay: `${index * 40}ms` }"
        >
          <td v-for="cell in row.getVisibleCells()" :key="cell.id">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
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
import type { Vendor } from '../types/Vendor';

defineEmits<{
  addVendor: [];
}>();

const vendorStore = useVendorStore();
const showDeleteDialog = ref(false);
const vendorToDelete = ref<Vendor | null>(null);
const sorting = ref<SortingState>([]);
const searchQuery = ref('');

function confirmDelete(vendor: Vendor) {
  vendorToDelete.value = vendor;
  showDeleteDialog.value = true;
}

async function handleDelete() {
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
        class: `badge ${value === 'Partner' ? 'badge-partner' : 'badge-supplier'}`,
      }, value);
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: (info) =>
      h(
        'button',
        {
          class: 'btn-delete-icon',
          onClick: () => confirmDelete(info.row.original),
          title: 'Delete vendor',
        },
        [
          h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '16',
            height: '16',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }, [
            h('polyline', { points: '3 6 5 6 21 6' }),
            h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
          ]),
        ]
      ),
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

.vendor-card {
  background-color: var(--card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 24px;
  box-shadow: var(--shadow);
  animation: fadeIn 0.3s ease;
}

/* ── Toolbar ── */

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.search-wrapper {
  position: relative;
  max-width: 400px;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid var(--input);
  border-radius: var(--radius);
  background-color: var(--card);
  color: var(--foreground);
  font-size: 14px;
  font-family: var(--font-sans);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input::placeholder {
  color: var(--muted);
}

.search-input:focus {
  border-color: var(--ring);
  box-shadow: 0 0 0 3px hsl(200 98% 39% / 0.15);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius);
  background-color: var(--primary);
  color: var(--primary-foreground);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-add:hover {
  opacity: 0.9;
}

.btn-add:active {
  transform: scale(0.98);
}

/* ── State Messages ── */

.state-message {
  padding: 40px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}

.state-message.error {
  color: var(--destructive);
}

/* ── Table ── */

.vendors-table {
  width: 100%;
  border-collapse: collapse;
}

.vendors-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border);
  user-select: none;
}

.vendors-table th.sortable {
  cursor: pointer;
}

.vendors-table th.sortable:hover {
  color: var(--foreground);
}

.sort-indicator {
  color: var(--primary);
}

.vendors-table td {
  padding: 16px;
  font-size: 14px;
  color: var(--card-foreground);
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.table-row {
  animation: fadeInUp 0.3s ease both;
  transition: background-color 0.15s ease;
}

.table-row:hover {
  background-color: var(--background);
}

/* ── Badges ── */

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
}

.badge-partner {
  background-color: var(--secondary);
  color: var(--secondary-foreground);
}

.badge-supplier {
  background-color: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
}

/* ── Delete Button ── */

.btn-delete-icon {
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

.btn-delete-icon:hover {
  color: var(--destructive);
  background-color: hsl(0 72% 50% / 0.1);
}

/* ── Responsive ── */

@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    max-width: 100%;
  }

  .vendors-table th,
  .vendors-table td {
    padding: 10px 8px;
    font-size: 13px;
  }
}
</style>
