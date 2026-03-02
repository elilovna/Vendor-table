import { computed, type ComputedRef } from 'vue'
import { useQuery, useMutation, useQueryClient, type UseMutationReturnType } from '@tanstack/vue-query'
import { VendorService } from '@/services/VendorService'
import type { Vendor, VendorInput } from '@/types/Vendor'

const VENDORS_KEY = ['vendors'] as const

interface UseVendorsReturn {
  vendors: ComputedRef<Vendor[]>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  createVendor: UseMutationReturnType<Vendor, Error, VendorInput, unknown>
  updateVendor: UseMutationReturnType<Vendor, Error, { id: number; vendor: VendorInput }, unknown>
  deleteVendor: UseMutationReturnType<void, Error, number, unknown>
}

export function useVendors(): UseVendorsReturn {
  const queryClient = useQueryClient()

  const { data, isLoading: queryLoading, error: queryError } = useQuery({
    queryKey: VENDORS_KEY,
    queryFn: () => VendorService.getVendors(),
    select: (data) => [...data].reverse(),
  })

  const vendors = computed(() => data.value ?? [])
  const isLoading = computed(() => queryLoading.value)
  const error = computed(() => queryError.value)

  const createVendor = useMutation({
    mutationFn: (vendor: VendorInput) => VendorService.createVendor(vendor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY })
    },
  })

  const updateVendor = useMutation({
    mutationFn: ({ id, vendor }: { id: number; vendor: VendorInput }) =>
      VendorService.updateVendor(id, vendor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY })
    },
  })

  const deleteVendor = useMutation({
    mutationFn: (id: number) => VendorService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY })
    },
  })

  return {
    vendors,
    isLoading,
    error,
    createVendor,
    updateVendor,
    deleteVendor,
  }
}
