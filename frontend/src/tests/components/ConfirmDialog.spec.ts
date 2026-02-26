import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmDialog from '../../components/ConfirmDialog.vue';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: false,
    title: 'Confirm Action',
    message: 'Are you sure?'
  };

  it('renders title and message', () => {
    const wrapper = mount(ConfirmDialog, { props: defaultProps });

    expect(wrapper.find('h3').text()).toBe('Confirm Action');
    expect(wrapper.find('p').text()).toBe('Are you sure?');
  });

  it('emits confirm when confirm button is clicked', async () => {
    const wrapper = mount(ConfirmDialog, { props: defaultProps });

    await wrapper.find('.confirm-dialog__confirm-btn').trigger('click');

    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(ConfirmDialog, { props: defaultProps });

    await wrapper.find('.confirm-dialog__cancel-btn').trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });
});
