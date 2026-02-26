import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import VendorList from '../../components/VendorList.vue';
import { useVendorStore } from '../../stores/vendorStore';
import type { Vendor } from '../../types/Vendor';

describe('VendorList', () => {
  const mockVendors: Vendor[] = [
    {
      id: 1,
      name: 'Test Company 1',
      contact_person: 'John Test',
      email: 'john@testcompany.com',
      partner_type: 'Supplier'
    },
    {
      id: 2,
      name: 'Test Company 2',
      contact_person: 'Jane Test',
      email: 'jane@testcompany.com',
      partner_type: 'Partner'
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(VendorList, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ]
      }
    });
    expect(wrapper.find('.vendor-list').exists()).toBe(true);
    expect(wrapper.find('.vendor-list__search-input').exists()).toBe(true);
    expect(wrapper.find('.vendor-list__add-btn').exists()).toBe(true);
  });

  it('calls fetchVendors on mount', () => {
    mount(VendorList, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ]
      }
    });

    const store = useVendorStore();
    expect(store.fetchVendors).toHaveBeenCalledTimes(1);
  });

  it('displays loading message when loading', () => {
    const wrapper = mount(VendorList, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: true, vendors: [], error: null }
            }
          })
        ]
      }
    });

    expect(wrapper.text()).toContain('Loading vendors...');
    expect(wrapper.find('.vendor-table').exists()).toBe(false);
  });

  it('displays error message when there is an error', () => {
    const wrapper = mount(VendorList, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, vendors: [], error: 'Failed to load vendors' }
            }
          })
        ]
      }
    });

    expect(wrapper.find('.vendor-list__state--error').exists()).toBe(true);
    expect(wrapper.find('.vendor-list__state--error').text()).toBe('Failed to load vendors');
    expect(wrapper.find('.vendor-table').exists()).toBe(false);
  });

  it('displays "no vendors" message when vendor list is empty', () => {
    const wrapper = mount(VendorList, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, vendors: [], error: null }
            }
          })
        ]
      }
    });

    expect(wrapper.find('.vendor-list__state').exists()).toBe(true);
    expect(wrapper.text()).toContain('No vendors found');
    expect(wrapper.find('.vendor-table').exists()).toBe(false);
  });

  it('displays vendor table with correct data when vendors are available', () => {
    const wrapper = mount(VendorList, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, vendors: mockVendors, error: null }
            }
          })
        ]
      }
    });

    // 5 columns: Name, Contact Person, Email, Partner Type, Actions
    expect(wrapper.find('.vendor-table').exists()).toBe(true);
    expect(wrapper.findAll('th').length).toBe(5);
    expect(wrapper.findAll('tbody tr').length).toBe(2);

    // Check content of first row (no ID column)
    const firstRow = wrapper.findAll('tbody tr')[0];
    expect(firstRow.findAll('td')[0].text()).toBe('Test Company 1');
    expect(firstRow.findAll('td')[1].text()).toBe('John Test');
    expect(firstRow.findAll('td')[2].text()).toBe('john@testcompany.com');
    expect(firstRow.findAll('td')[3].text()).toBe('Supplier');
  });

  it('renders a delete button for each vendor row', () => {
    const wrapper = mount(VendorList, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, vendors: mockVendors, error: null }
            }
          })
        ]
      }
    });

    const deleteButtons = wrapper.findAll('.vendor-table__delete-btn');
    expect(deleteButtons.length).toBe(2);
  });

  it('opens confirmation dialog when delete button is clicked', async () => {
    const wrapper = mount(VendorList, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, vendors: mockVendors, error: null }
            }
          })
        ]
      }
    });

    await wrapper.findAll('.vendor-table__delete-btn')[0].trigger('click');

    const dialog = wrapper.find('.confirm-dialog');
    expect(dialog.exists()).toBe(true);
    expect(dialog.text()).toContain('Test Company 1');
  });
});
