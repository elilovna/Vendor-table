<template>
  <div class="vendor-list">
    <h2>Vendor List</h2>
    <div v-if="vendorStore.loading">Loading vendors...</div>
    <div v-else-if="vendorStore.error" class="error">{{ vendorStore.error }}</div>
    <div v-else-if="vendorStore.vendors.length === 0" class="no-vendors">No vendors found. Add your first vendor!</div>
    <table v-else class="vendors-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Contact Person</th>
          <th>Email</th>
          <th>Partner Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vendor in vendorStore.vendors" :key="vendor.id">
          <td>{{ vendor.id }}</td>
          <td>{{ vendor.name }}</td>
          <td>{{ vendor.contact_person }}</td>
          <td>{{ vendor.email }}</td>
          <td>{{ vendor.partner_type }}</td>
          <td>
            <button class="btn-delete" @click="confirmDelete(vendor)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <ConfirmDialog
      :open="showDeleteDialog"
      title="Delete Vendor"
      :message="`Are you sure you want to delete '${vendorToDelete?.name}'? This action cannot be undone.`"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVendorStore } from '../stores/vendorStore';
import ConfirmDialog from './ConfirmDialog.vue';
import type { Vendor } from '../types/Vendor';

const vendorStore = useVendorStore();
const showDeleteDialog = ref(false);
const vendorToDelete = ref<Vendor | null>(null);

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

onMounted(() => {
  vendorStore.fetchVendors();
});
</script>

<style scoped>
.vendor-list {
  margin: 20px 0;
}

.vendors-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.vendors-table th,
.vendors-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.vendors-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.vendors-table tr:hover {
  background-color: #f5f5f5;
}

.error {
  color: red;
  padding: 10px;
}

.no-vendors {
  padding: 20px;
  text-align: center;
  color: #666;
}

.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: #e74c3c;
  color: white;
  cursor: pointer;
  font-size: 13px;
}

.btn-delete:hover {
  background-color: #c0392b;
}
</style>