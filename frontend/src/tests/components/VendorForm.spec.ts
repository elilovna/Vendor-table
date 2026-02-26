import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import VendorForm from '../../components/VendorForm.vue';
import { useVendorStore } from '../../stores/vendorStore';

describe('VendorForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(VendorForm, {
      props: { open: false },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, error: null }
            }
          })
        ]
      }
    });

    expect(wrapper.find('.vendor-form__title').text()).toBe('Add New Vendor');
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Add Vendor');
  });

  it('contains all required form fields', () => {
    const wrapper = mount(VendorForm, {
      props: { open: false },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, error: null }
            }
          })
        ]
      }
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
    const wrapper = mount(VendorForm, {
      props: { open: false },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, error: null }
            }
          })
        ]
      }
    });

    const store = useVendorStore();

    await wrapper.find('#name').setValue('Test Company');
    await wrapper.find('#contactPerson').setValue('John Test');
    await wrapper.find('#email').setValue('john@testcompany.com');
    await wrapper.find('#partnerType').setValue('Partner');

    await wrapper.find('form').trigger('submit');

    expect(store.addVendor).toHaveBeenCalledWith({
      name: 'Test Company',
      contact_person: 'John Test',
      email: 'john@testcompany.com',
      partner_type: 'Partner'
    });
  });

  it('shows loading state when submitting', async () => {
    const wrapper = mount(VendorForm, {
      props: { open: false },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: true, error: null }
            }
          })
        ]
      }
    });

    expect(wrapper.find('button[type="submit"]').text()).toBe('Adding...');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('shows error message when submission fails', async () => {
    const wrapper = mount(VendorForm, {
      props: { open: false },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, error: 'Failed to add vendor' }
            }
          })
        ]
      }
    });

    expect(wrapper.find('.vendor-form__error').exists()).toBe(true);
    expect(wrapper.find('.vendor-form__error').text()).toBe('Failed to add vendor');
  });
});
