import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VendorDetailPanel from '../../components/VendorDetailPanel.vue';
import type { Vendor } from '../../types/Vendor';

describe('VendorDetailPanel', () => {
  const mockVendor: Vendor = {
    id: 1,
    name: 'Acme Corp',
    contact_person: 'Jane Smith',
    email: 'jane@acme.com',
    partner_type: 'Partner',
  };

  function mountPanel(vendor: Vendor | null = mockVendor) {
    return mount(VendorDetailPanel, {
      props: { vendor },
    });
  }

  it('renders as a dialog element', () => {
    const wrapper = mountPanel();

    expect(wrapper.find('dialog').exists()).toBe(true);
  });

  it('renders vendor name as title', () => {
    const wrapper = mountPanel();

    expect(wrapper.find('.vendor-detail__title').text()).toBe('Acme Corp');
  });

  it('displays contact person', () => {
    const wrapper = mountPanel();
    const fields = wrapper.findAll('.vendor-detail__field');
    const contactField = fields[0];

    expect(contactField.find('.vendor-detail__label').text()).toBe('Contact Person');
    expect(contactField.find('.vendor-detail__value').text()).toBe('Jane Smith');
  });

  it('displays email', () => {
    const wrapper = mountPanel();
    const fields = wrapper.findAll('.vendor-detail__field');
    const emailField = fields[1];

    expect(emailField.find('.vendor-detail__label').text()).toBe('Email');
    expect(emailField.find('.vendor-detail__value').text()).toBe('jane@acme.com');
  });

  it('displays partner type with correct badge class', () => {
    const wrapper = mountPanel();

    const badge = wrapper.find('.badge');
    expect(badge.text()).toBe('Partner');
    expect(badge.classes()).toContain('badge--partner');
  });

  it('renders supplier badge for supplier type', () => {
    const supplierVendor: Vendor = { ...mockVendor, partner_type: 'Supplier' };
    const wrapper = mountPanel(supplierVendor);

    const badge = wrapper.find('.badge');
    expect(badge.text()).toBe('Supplier');
    expect(badge.classes()).toContain('badge--supplier');
  });

  it('emits close when close button is clicked', async () => {
    const wrapper = mountPanel();

    await wrapper.find('[aria-label="Close details"]').trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits edit with vendor when edit button is clicked', async () => {
    const wrapper = mountPanel();

    await wrapper.find('.btn--outline').trigger('click');

    expect(wrapper.emitted('edit')).toHaveLength(1);
    expect(wrapper.emitted('edit')![0]).toEqual([mockVendor]);
  });

  it('emits delete with vendor when delete button is clicked', async () => {
    const wrapper = mountPanel();

    await wrapper.find('.btn--danger').trigger('click');

    expect(wrapper.emitted('delete')).toHaveLength(1);
    expect(wrapper.emitted('delete')![0]).toEqual([mockVendor]);
  });

  it('has close button with accessible label', () => {
    const wrapper = mountPanel();

    expect(wrapper.find('[aria-label="Close details"]').exists()).toBe(true);
  });
});
