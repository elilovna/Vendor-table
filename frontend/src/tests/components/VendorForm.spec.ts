import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import VendorForm from '../../components/VendorForm.vue';
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

function mountForm(propsOverride = {}) {
  return mount(VendorForm, {
    props: { open: false, ...propsOverride },
    global: {
      plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]],
    },
  });
}

describe('VendorForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(VendorService.getVendors).mockResolvedValue([]);
  });

  describe('rendering', () => {
    it('renders add mode title and button by default', () => {
      const wrapper = mountForm();

      expect(wrapper.find('.vendor-form__title').text()).toBe('Add New Vendor');
      expect(wrapper.find('button[type="submit"]').text()).toBe('Add Vendor');
    });

    it('renders edit mode title and button when vendor prop is provided', () => {
      const vendor: Vendor = {
        id: 1,
        name: 'Acme',
        contact_person: 'Jane',
        email: 'jane@acme.com',
        partner_type: 'Partner',
      };
      const wrapper = mountForm({ vendor });

      expect(wrapper.find('.vendor-form__title').text()).toBe('Edit Vendor');
      expect(wrapper.find('button[type="submit"]').text()).toBe('Save Changes');
    });

    it('contains all required form fields', () => {
      const wrapper = mountForm();

      expect(wrapper.find('#name').exists()).toBe(true);
      expect(wrapper.find('#contactPerson').exists()).toBe(true);
      expect(wrapper.find('#email').exists()).toBe(true);
      expect(wrapper.find('#partnerType').exists()).toBe(true);
    });

    it('renders partner type options', () => {
      const wrapper = mountForm();
      const options = wrapper.findAll('#partnerType option');

      expect(options.length).toBe(2);
      expect(options[0].text()).toBe('Supplier');
      expect(options[1].text()).toBe('Partner');
    });

    it('renders as a dialog element', () => {
      const wrapper = mountForm();

      expect(wrapper.find('dialog').exists()).toBe(true);
    });

    it('has close button with aria-label', () => {
      const wrapper = mountForm();

      expect(wrapper.find('[aria-label="Close dialog"]').exists()).toBe(true);
    });

    it('has a cancel button', () => {
      const wrapper = mountForm();
      const cancelBtn = wrapper.find('.btn--outline');

      expect(cancelBtn.text()).toBe('Cancel');
    });
  });

  describe('form labels and accessibility', () => {
    it('has label for every input field', () => {
      const wrapper = mountForm();

      expect(wrapper.find('label[for="name"]').text()).toBe('Name');
      expect(wrapper.find('label[for="contactPerson"]').text()).toBe('Contact Person');
      expect(wrapper.find('label[for="email"]').text()).toBe('Email');
      expect(wrapper.find('label[for="partnerType"]').text()).toBe('Partner Type');
    });
  });

  describe('form submission - create mode', () => {
    it('submits form data correctly', async () => {
      vi.mocked(VendorService.createVendor).mockResolvedValue({
        id: 1,
        name: 'Test Company',
        contact_person: 'John Test',
        email: 'john@testcompany.com',
        partner_type: 'Partner',
      });

      const wrapper = mountForm();

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

    it('emits close after successful submission', async () => {
      vi.mocked(VendorService.createVendor).mockResolvedValue({
        id: 1,
        name: 'Test',
        contact_person: 'Test',
        email: 'test@test.com',
        partner_type: 'Supplier',
      });

      const wrapper = mountForm();

      await wrapper.find('#name').setValue('Test');
      await wrapper.find('#contactPerson').setValue('Test');
      await wrapper.find('#email').setValue('test@test.com');

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });

  describe('form submission - edit mode', () => {
    const existingVendor: Vendor = {
      id: 5,
      name: 'Old Name',
      contact_person: 'Old Person',
      email: 'old@test.com',
      partner_type: 'Supplier',
    };

    it('calls updateVendor with id when editing', async () => {
      vi.mocked(VendorService.updateVendor).mockResolvedValue({
        ...existingVendor,
        name: 'Updated Name',
      });

      const wrapper = mountForm({ vendor: existingVendor });

      // Fill all required fields (form starts empty since open=false skips setValues)
      await wrapper.find('#name').setValue('Updated Name');
      await wrapper.find('#contactPerson').setValue('Old Person');
      await wrapper.find('#email').setValue('old@test.com');
      await wrapper.find('#partnerType').setValue('Supplier');

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(VendorService.updateVendor).toHaveBeenCalledWith(5, {
        name: 'Updated Name',
        contact_person: 'Old Person',
        email: 'old@test.com',
        partner_type: 'Supplier',
      });
      expect(VendorService.createVendor).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('shows error message when creation fails', async () => {
      vi.mocked(VendorService.createVendor).mockRejectedValue(new Error('Email already exists'));

      const wrapper = mountForm();

      await wrapper.find('#name').setValue('Test Company');
      await wrapper.find('#contactPerson').setValue('John Test');
      await wrapper.find('#email').setValue('john@testcompany.com');

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.find('.vendor-form__error').exists()).toBe(true);
      expect(wrapper.find('.vendor-form__error').text()).toBe('Email already exists');
    });

    it('does not emit close when submission fails', async () => {
      vi.mocked(VendorService.createVendor).mockRejectedValue(new Error('Server error'));

      const wrapper = mountForm();

      await wrapper.find('#name').setValue('Test');
      await wrapper.find('#contactPerson').setValue('Test');
      await wrapper.find('#email').setValue('test@test.com');

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.emitted('close')).toBeUndefined();
    });
  });

  describe('cancel and close', () => {
    it('emits close when cancel button is clicked', async () => {
      const wrapper = mountForm();

      await wrapper.find('.btn--outline').trigger('click');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('emits close when close icon button is clicked', async () => {
      const wrapper = mountForm();

      await wrapper.find('[aria-label="Close dialog"]').trigger('click');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });
});
