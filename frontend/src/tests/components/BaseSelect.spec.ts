import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseSelect from '../../components/BaseSelect.vue';

describe('BaseSelect', () => {
  const defaultProps = {
    modelValue: '',
    options: ['Supplier', 'Partner'] as readonly string[],
  };

  function mountSelect(propsOverride = {}) {
    return mount(BaseSelect, {
      props: { ...defaultProps, ...propsOverride },
    });
  }

  it('renders a select element', () => {
    const wrapper = mountSelect();

    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('renders all options', () => {
    const wrapper = mountSelect();
    const options = wrapper.findAll('option');

    expect(options).toHaveLength(2);
    expect(options[0].text()).toBe('Supplier');
    expect(options[1].text()).toBe('Partner');
  });

  it('renders placeholder option when placeholder prop is provided', () => {
    const wrapper = mountSelect({ placeholder: 'All Types' });
    const options = wrapper.findAll('option');

    expect(options).toHaveLength(3);
    expect(options[0].text()).toBe('All Types');
    expect(options[0].element.value).toBe('');
  });

  it('does not render placeholder option when placeholder is not provided', () => {
    const wrapper = mountSelect();
    const options = wrapper.findAll('option');

    expect(options).toHaveLength(2);
    expect(options[0].text()).toBe('Supplier');
  });

  it('sets the select value from modelValue prop', () => {
    const wrapper = mountSelect({ modelValue: 'Partner' });
    const select = wrapper.find('select');

    expect((select.element as HTMLSelectElement).value).toBe('Partner');
  });

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = mountSelect();

    await wrapper.find('select').setValue('Partner');

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Partner']);
  });

  it('applies id attribute when provided', () => {
    const wrapper = mountSelect({ id: 'type-filter' });

    expect(wrapper.find('select').attributes('id')).toBe('type-filter');
  });

  it('applies placeholder modifier class when value is empty', () => {
    const wrapper = mountSelect({ modelValue: '' });

    expect(wrapper.find('select').classes()).toContain('base-select--placeholder');
  });

  it('does not apply placeholder modifier class when value is selected', () => {
    const wrapper = mountSelect({ modelValue: 'Supplier' });

    expect(wrapper.find('select').classes()).not.toContain('base-select--placeholder');
  });
});
