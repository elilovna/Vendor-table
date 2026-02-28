import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import VendorList from '../../components/table/VendorList.vue';
import { VendorService } from '../../services/VendorService';
import type { Vendor } from '../../types/Vendor';

vi.mock('../../services/VendorService', () => ({
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

describe('VendorList', () => {
  const mockVendors: Vendor[] = [
    {
      id: 1,
      name: 'Test Company 1',
      contact_person: 'John Test',
      email: 'john@testcompany.com',
      partner_type: 'Supplier',
    },
    {
      id: 2,
      name: 'Test Company 2',
      contact_person: 'Jane Test',
      email: 'jane@testcompany.com',
      partner_type: 'Partner',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders correctly', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue([]);

    const wrapper = mount(VendorList, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
      },
    });

    await flushPromises();

    expect(wrapper.find('.vendor-list').exists()).toBe(true);
    expect(wrapper.find('.vendor-list__search-input').exists()).toBe(true);
    expect(wrapper.find('.vendor-list__add-btn').exists()).toBe(true);
  });

  it('fetches vendors automatically on mount', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);

    mount(VendorList, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
      },
    });

    await flushPromises();

    expect(VendorService.getVendors).toHaveBeenCalledTimes(1);
  });

  it('displays loading message when loading', () => {
    vi.mocked(VendorService.getVendors).mockReturnValue(new Promise(() => {}));

    const wrapper = mount(VendorList, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
      },
    });

    expect(wrapper.text()).toContain('Loading vendors...');
    expect(wrapper.find('.vendor-table').exists()).toBe(false);
  });

  it('displays error message when there is an error', async () => {
    vi.mocked(VendorService.getVendors).mockRejectedValue(new Error('Failed to load vendors'));

    const wrapper = mount(VendorList, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
      },
    });

    await flushPromises();

    expect(wrapper.find('.vendor-list__state--error').exists()).toBe(true);
    expect(wrapper.find('.vendor-list__state--error').text()).toBe('Failed to load vendors');
    expect(wrapper.find('.vendor-table').exists()).toBe(false);
  });

  it('displays "no vendors" message when vendor list is empty', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue([]);

    const wrapper = mount(VendorList, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
      },
    });

    await flushPromises();

    expect(wrapper.find('.vendor-list__state').exists()).toBe(true);
    expect(wrapper.text()).toContain('No vendors found');
    expect(wrapper.find('.vendor-table').exists()).toBe(false);
  });

  it('displays vendor table with correct data when vendors are available', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);

    const wrapper = mount(VendorList, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
      },
    });

    await flushPromises();

    expect(wrapper.find('.vendor-table').exists()).toBe(true);
    expect(wrapper.findAll('tbody tr').length).toBe(2);
  });
});
