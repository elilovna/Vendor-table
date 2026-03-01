import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: false,
    title: 'Delete Vendor',
    message: 'Are you sure you want to delete this vendor?',
  };

  function mountDialog(propsOverride = {}) {
    return mount(ConfirmDialog, {
      props: { ...defaultProps, ...propsOverride },
    });
  }

  it('renders title and message', () => {
    const wrapper = mountDialog();

    expect(wrapper.find('.confirm-dialog__title').text()).toBe('Delete Vendor');
    expect(wrapper.find('.confirm-dialog__message').text()).toBe(
      'Are you sure you want to delete this vendor?'
    );
  });

  it('renders the alert icon', () => {
    const wrapper = mountDialog();

    expect(wrapper.find('.confirm-dialog__icon').exists()).toBe(true);
  });

  it('emits confirm when delete button is clicked', async () => {
    const wrapper = mountDialog();

    await wrapper.find('.btn--danger').trigger('click');

    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mountDialog();

    await wrapper.find('.btn--outline').trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('has correct button labels', () => {
    const wrapper = mountDialog();
    const buttons = wrapper.findAll('button');

    expect(buttons[0].text()).toBe('Cancel');
    expect(buttons[1].text()).toBe('Delete');
  });

  it('renders as a dialog element', () => {
    const wrapper = mountDialog();

    expect(wrapper.find('dialog').exists()).toBe(true);
  });
});
