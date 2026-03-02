import { computed, type WritableComputedRef } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { PARTNER_TYPES, type PartnerType } from '@/types/Vendor'
import type { SortingState } from '@tanstack/vue-table'

const VALID_SORT_COLUMNS = ['name', 'contact_person', 'email', 'partner_type'] as const

interface UseTableUrlStateReturn {
  searchQuery: WritableComputedRef<string>
  sorting: WritableComputedRef<SortingState>
  partnerTypeFilter: WritableComputedRef<PartnerType | null>
}

export function useTableUrlState(): UseTableUrlStateReturn {
  const route = useRoute()
  const router = useRouter()

  function updateQuery(params: Record<string, string | undefined>): void {
    const query: LocationQueryRaw = { ...route.query }
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === '') {
        delete query[key]
      } else {
        query[key] = value
      }
    }
    router.replace({ query })
  }

  const searchQuery = computed({
    get: () => (typeof route.query.search === 'string' ? route.query.search : ''),
    set: (value: string) => updateQuery({ search: value || undefined }),
  })

  const sorting = computed({
    get: (): SortingState => {
      const sort = route.query.sort
      const order = route.query.order
      if (
        typeof sort === 'string' &&
        (VALID_SORT_COLUMNS as readonly string[]).includes(sort)
      ) {
        return [{ id: sort, desc: order === 'desc' }]
      }
      return []
    },
    set: (value: SortingState) => {
      const first = value[0]
      if (first) {
        updateQuery({
          sort: first.id,
          order: first.desc ? 'desc' : 'asc',
        })
      } else {
        updateQuery({ sort: undefined, order: undefined })
      }
    },
  })

  const partnerTypeFilter = computed({
    get: (): PartnerType | null => {
      const type = route.query.type
      if (
        typeof type === 'string' &&
        (PARTNER_TYPES as readonly string[]).includes(type)
      ) {
        return type as PartnerType
      }
      return null
    },
    set: (value: PartnerType | null) => updateQuery({ type: value ?? undefined }),
  })

  return { searchQuery, sorting, partnerTypeFilter }
}
