import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createRouter, createMemoryHistory } from 'vue-router';
import VendorList from '@/components/Table/VendorList.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { VendorService } from '@/services/VendorService';
import type { Vendor } from '@/types/Vendor';

vi.mock('@/services/VendorService', () => ({
  VendorService: {
    getVendors: vi.fn(),
    createVendor: vi.fn(),
    updateVendor: vi.fn(),
    deleteVendor: vi.fn(),
  },
}));

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }],
  });
}

function mountList() {
  return mount(VendorList, {
    global: {
      plugins: [
        [VueQueryPlugin, { queryClient: createQueryClient() }],
        createTestRouter(),
      ],
    },
  });
}

describe('VendorList', () => {
  const mockVendors: Vendor[] = [
    {
      id: 1,
      name: 'Alpha Inc',
      contact_person: 'John Test',
      email: 'john@alpha.com',
      partner_type: 'Supplier',
    },
    {
      id: 2,
      name: 'Beta Corp',
      contact_person: 'Jane Test',
      email: 'jane@beta.com',
      partner_type: 'Partner',
    },
    {
      id: 3,
      name: 'Gamma LLC',
      contact_person: 'Bob Test',
      email: 'bob@gamma.com',
      partner_type: 'Supplier',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('renders toolbar with search, filter, and add button', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue([]);

      const wrapper = mountList();
      await flushPromises();

      expect(wrapper.find('.vendor-list').exists()).toBe(true);
      expect(wrapper.find('.vendor-list__search-input').exists()).toBe(true);
      expect(wrapper.find('.vendor-list__add-btn').exists()).toBe(true);
      expect(wrapper.find('#type-filter').exists()).toBe(true);
    });

    it('has accessible labels for search and filter', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue([]);

      const wrapper = mountList();
      await flushPromises();

      expect(wrapper.find('label[for="vendor-search"]').exists()).toBe(true);
      expect(wrapper.find('label[for="type-filter"]').exists()).toBe(true);
    });
  });

  describe('data fetching', () => {
    it('fetches vendors automatically on mount', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);

      mountList();
      await flushPromises();

      expect(VendorService.getVendors).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading state', () => {
    it('displays loading message while fetching', () => {
      vi.mocked(VendorService.getVendors).mockReturnValue(new Promise(() => {}));

      const wrapper = mountList();

      expect(wrapper.text()).toContain('Loading vendors...');
      expect(wrapper.find('.vendor-table').exists()).toBe(false);
    });
  });

  describe('error state', () => {
    it('displays error message when fetch fails', async () => {
      vi.mocked(VendorService.getVendors).mockRejectedValue(new Error('Failed to load vendors'));

      const wrapper = mountList();
      await flushPromises();

      expect(wrapper.find('.vendor-list__state--error').exists()).toBe(true);
      expect(wrapper.find('.vendor-list__state--error').text()).toBe('Failed to load vendors');
      expect(wrapper.find('.vendor-table').exists()).toBe(false);
    });
  });

  describe('empty state', () => {
    it('displays empty message when no vendors exist', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue([]);

      const wrapper = mountList();
      await flushPromises();

      expect(wrapper.find('.vendor-list__state').exists()).toBe(true);
      expect(wrapper.text()).toContain('No vendors found');
      expect(wrapper.find('.vendor-table').exists()).toBe(false);
    });
  });

  describe('table rendering', () => {
    it('renders table with correct row count', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);

      const wrapper = mountList();
      await flushPromises();

      expect(wrapper.find('.vendor-table').exists()).toBe(true);
      expect(wrapper.findAll('tbody tr').length).toBe(3);
    });

    it('renders table headers', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);

      const wrapper = mountList();
      await flushPromises();

      const headers = wrapper.findAll('th');
      const headerTexts = headers.map((h) => h.text().replace(/[↑↓↕]/g, '').trim());

      expect(headerTexts).toContain('Name');
      expect(headerTexts).toContain('Contact Person');
      expect(headerTexts).toContain('Email');
      expect(headerTexts).toContain('Partner Type');
      expect(headerTexts).toContain('Actions');
    });
  });

  describe('events', () => {
    it('emits addVendor when add button is clicked', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue([]);

      const wrapper = mountList();
      await flushPromises();

      await wrapper.find('.vendor-list__add-btn').trigger('click');

      expect(wrapper.emitted('addVendor')).toHaveLength(1);
    });
  });

  describe('search filtering', () => {
    it('filters table rows based on search input', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);

      const wrapper = mountList();
      await flushPromises();

      expect(wrapper.findAll('tbody tr').length).toBe(3);

      await wrapper.find('.vendor-list__search-input').setValue('Alpha');
      await flushPromises();

      expect(wrapper.findAll('tbody tr').length).toBe(1);
    });

    it('shows no-results message when search has no matches', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);

      const wrapper = mountList();
      await flushPromises();

      await wrapper.find('.vendor-list__search-input').setValue('zzzznonexistent');
      await flushPromises();

      expect(wrapper.text()).toContain('No vendors match your search');
      expect(wrapper.find('.vendor-table').exists()).toBe(false);
    });
  });

  describe('delete flow', () => {
    it('shows confirm dialog when delete is triggered', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);

      const wrapper = mountList();
      await flushPromises();

      const deleteButtons = wrapper.findAll('[aria-label^="Delete"]');
      expect(deleteButtons.length).toBeGreaterThan(0);

      await deleteButtons[0].trigger('click');
      await flushPromises();

      expect(wrapper.find('.confirm-dialog').exists()).toBe(true);
      expect(wrapper.text()).toContain('Delete Vendor');
    });

    it('calls deleteVendor service when delete is confirmed', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);
      vi.mocked(VendorService.deleteVendor).mockResolvedValue();

      const wrapper = mountList();
      await flushPromises();

      const deleteButtons = wrapper.findAll('[aria-label^="Delete"]');
      await deleteButtons[0].trigger('click');
      await flushPromises();

      wrapper.findComponent(ConfirmDialog).vm.$emit('confirm');
      await flushPromises();

      // useVendors reverses the array, so first row is last mock vendor
      const reversedVendors = [...mockVendors].reverse();
      expect(VendorService.deleteVendor).toHaveBeenCalledWith(reversedVendors[0].id);
    });
  });

  describe('edit flow', () => {
    it('emits editVendor when edit button is clicked', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);

      const wrapper = mountList();
      await flushPromises();

      const editButtons = wrapper.findAll('[aria-label^="Edit"]');
      expect(editButtons.length).toBeGreaterThan(0);

      await editButtons[0].trigger('click');
      await flushPromises();

      // useVendors reverses the array, so first row is last mock vendor
      const reversedVendors = [...mockVendors].reverse();
      expect(wrapper.emitted('editVendor')).toHaveLength(1);
      expect(wrapper.emitted('editVendor')![0]).toEqual([reversedVendors[0]]);
    });
  });
});
