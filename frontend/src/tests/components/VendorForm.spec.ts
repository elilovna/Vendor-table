import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import VendorForm from '../../components/VendorForm.vue';
import { VendorService } from '../../services/VendorService';

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

describe('VendorForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(VendorService.getVendors).mockResolvedValue([]);
  });

  it('renders correctly', () => {
    const wrapper = mount(VendorForm, {
      props: { open: false },
      global: {
        plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
      },
    });

    expect(wrapper.find('.vendor-form__title').text()).toBe('Add New Vendor');
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Add Vendor');
  });

  it('contains all required form fields', () => {
    const wrapper = mount(VendorForm, {
      props: { open: false },
      global: {
        plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
      },
    });

    expect(wrapper.find('#name').exists()).toBe(true);
    expect(wrapper.find('#contactPerson').exists()).toBe(true);
    expect(wrapper.find('#email').exists()).toBe(true);
    expect(wrapper.find('#partnerType').exists()).toBe(true);

    const options = wrapper.findAll('#partnerType option');
    expect(options.length).toBe(2);
    expect(options[0].text()).toBe('Supplier');
    expect(options[1].text()).toBe('Partner');
  });

  it('submits form data correctly', async () => {
    vi.mocked(VendorService.createVendor).mockResolvedValue({
      id: 1,
      name: 'Test Company',
      contact_person: 'John Test',
      email: 'john@testcompany.com',
      partner_type: 'Partner',
    });

    const wrapper = mount(VendorForm, {
      props: { open: false },
      global: {
        plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
      },
    });

    await wrapper.find('#name').setValue('Test Company');
    await wrapper.find('#contactPerson').setValue('John Test');
    await wrapper.find('#email').setValue('john@testcompany.com');
    await wrapper.find('#partnerType').setValue('Partner');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(VendorService.createVendor).toHaveBeenCalledWith({
      name: 'Test Company',
      contact_person: 'John Test',
      email: 'john@testcompany.com',
      partner_type: 'Partner',
    });
  });

  it('shows error message when submission fails', async () => {
    vi.mocked(VendorService.createVendor).mockRejectedValue(new Error('Email already exists'));

    const wrapper = mount(VendorForm, {
      props: { open: false },
      global: {
        plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
      },
    });

    await wrapper.find('#name').setValue('Test Company');
    await wrapper.find('#contactPerson').setValue('John Test');
    await wrapper.find('#email').setValue('john@testcompany.com');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.vendor-form__error').exists()).toBe(true);
    expect(wrapper.find('.vendor-form__error').text()).toBe('Email already exists');
  });
});
