import { describe, it, expect, vi } from 'vitest';
import { createVendorColumns } from '@/components/vendor/vendorColumns';

describe('createVendorColumns', () => {
  const callbacks = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onView: vi.fn(),
  };

  it('creates 6 columns', () => {
    const columns = createVendorColumns(callbacks);

    expect(columns).toHaveLength(6);
  });

  it('defines name column with correct header', () => {
    const columns = createVendorColumns(callbacks);
    const nameCol = columns[0];

    expect(nameCol?.header).toBe('Name');
  });

  it('defines contact_person column with correct header', () => {
    const columns = createVendorColumns(callbacks);
    const contactCol = columns[1];

    expect(contactCol?.header).toBe('Contact Person');
  });

  it('defines email column with correct header', () => {
    const columns = createVendorColumns(callbacks);
    const emailCol = columns[2];

    expect(emailCol?.header).toBe('Email');
  });

  it('defines partner_type column with correct header', () => {
    const columns = createVendorColumns(callbacks);
    const typeCol = columns[3];

    expect(typeCol?.header).toBe('Partner Type');
  });

  it('defines actions column with sorting disabled', () => {
    const columns = createVendorColumns(callbacks);
    const actionsCol = columns[4];

    expect(actionsCol?.header).toBe('Actions');
    expect(actionsCol?.enableSorting).toBe(false);
  });

  it('defines view column with empty header and sorting disabled', () => {
    const columns = createVendorColumns(callbacks);
    const viewCol = columns[5];

    expect(viewCol?.header).toBe('');
    expect(viewCol?.enableSorting).toBe(false);
  });

  it('assigns correct CSS class metadata to contact column', () => {
    const columns = createVendorColumns(callbacks);

    expect(columns[1]?.meta?.class).toBe('vendor-table__col--contact');
  });

  it('assigns correct CSS class metadata to partner type column', () => {
    const columns = createVendorColumns(callbacks);

    expect(columns[3]?.meta?.class).toBe('vendor-table__col--type');
  });

  it('assigns correct CSS class metadata to actions column', () => {
    const columns = createVendorColumns(callbacks);

    expect(columns[4]?.meta?.class).toBe('vendor-table__col--actions');
  });

  it('assigns correct CSS class metadata to view column', () => {
    const columns = createVendorColumns(callbacks);

    expect(columns[5]?.meta?.class).toBe('vendor-table__col--view');
  });
});
