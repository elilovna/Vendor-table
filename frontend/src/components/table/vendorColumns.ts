import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { RowData } from '@tanstack/vue-table'
import PencilIcon from '../icons/PencilIcon.vue'
import TrashIcon from '../icons/TrashIcon.vue'
import EyeIcon from '../icons/EyeIcon.vue'
import type { Vendor } from '../../types/Vendor'

declare module '@tanstack/vue-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue = unknown> {
    class?: string
  }
}

interface VendorColumnCallbacks {
  onEdit: (vendor: Vendor) => void
  onDelete: (vendor: Vendor) => void
  onView: (vendor: Vendor) => void
}

const columnHelper = createColumnHelper<Vendor>()

export function createVendorColumns(callbacks: VendorColumnCallbacks) {
  return [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => h('span', { style: 'font-weight: 600' }, info.getValue()),
    }),
    columnHelper.accessor('contact_person', {
      header: 'Contact Person',
      meta: { class: 'vendor-table__col--contact' },
    }),
    columnHelper.accessor('email', {
      header: 'Email',
    }),
    columnHelper.accessor('partner_type', {
      header: 'Partner Type',
      meta: { class: 'vendor-table__col--type' },
      cell: (info) => {
        const value = info.getValue()
        return h(
          'span',
          { class: `badge ${value === 'Partner' ? 'badge--partner' : 'badge--supplier'}` },
          value,
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { class: 'vendor-table__col--actions' },
      cell: (info) =>
        h('div', { class: 'vendor-table__actions' }, [
          h(
            'button',
            {
              class: 'btn btn--icon',
              onClick: () => callbacks.onEdit(info.row.original),
              'aria-label': `Edit ${info.row.original.name}`,
            },
            [h(PencilIcon)],
          ),
          h(
            'button',
            {
              class: 'btn btn--icon',
              onClick: () => callbacks.onDelete(info.row.original),
              'aria-label': `Delete ${info.row.original.name}`,
            },
            [h(TrashIcon)],
          ),
        ]),
    }),
    columnHelper.display({
      id: 'view',
      header: '',
      enableSorting: false,
      meta: { class: 'vendor-table__col--view' },
      cell: (info) =>
        h(
          'button',
          {
            class: 'btn btn--icon',
            onClick: () => callbacks.onView(info.row.original),
            'aria-label': `View details for ${info.row.original.name}`,
          },
          [h(EyeIcon)],
        ),
    }),
  ]
}
