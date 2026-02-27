import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createApp, defineComponent } from 'vue';
import { useVendors } from '../../composables/useVendors';
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

function withSetup<T>(composable: () => T): { result: T; queryClient: QueryClient } {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  let result!: T;
  const app = createApp(
    defineComponent({
      setup() {
        result = composable();
        return () => null;
      },
    })
  );
  app.use(VueQueryPlugin, { queryClient });
  app.mount(document.createElement('div'));

  return { result, queryClient };
}

describe('useVendors', () => {
  const mockVendors: Vendor[] = [
    {
      id: 1,
      name: 'Test Company 1',
      contact_person: 'John Test',
      email: 'john@testcompany.com',
      partner_type: 'Supplier',
    },
    {
      id: 2,
      name: 'Test Company 2',
      contact_person: 'Jane Test',
      email: 'jane@testcompany.com',
      partner_type: 'Partner',
    },
  ];

  beforeEach(() => {
    vi.mocked(VendorService.getVendors).mockReset();
    vi.mocked(VendorService.createVendor).mockReset();
    vi.mocked(VendorService.updateVendor).mockReset();
    vi.mocked(VendorService.deleteVendor).mockReset();
  });

  it('should fetch vendors on mount', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);

    const { result } = withSetup(() => useVendors());
    await flushPromises();

    expect(VendorService.getVendors).toHaveBeenCalledTimes(1);
    expect(result.vendors.value).toEqual([...mockVendors].reverse());
    expect(result.isLoading.value).toBe(false);
  });

  it('should set loading state while fetching', () => {
    vi.mocked(VendorService.getVendors).mockReturnValue(new Promise(() => {}));

    const { result } = withSetup(() => useVendors());

    expect(result.isLoading.value).toBe(true);
  });

  it('should handle fetch error', async () => {
    vi.mocked(VendorService.getVendors).mockRejectedValue(new Error('Network error'));

    const { result } = withSetup(() => useVendors());
    await flushPromises();

    expect(result.error.value).toBeInstanceOf(Error);
    expect(result.error.value?.message).toBe('Network error');
  });

  it('should create a vendor and invalidate queries', async () => {
    const newVendor: Vendor = {
      name: 'New Company',
      contact_person: 'New Person',
      email: 'new@company.com',
      partner_type: 'Supplier',
    };
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);
    vi.mocked(VendorService.createVendor).mockResolvedValue({ ...newVendor, id: 3 });

    const { result } = withSetup(() => useVendors());
    await flushPromises();

    await result.createVendor.mutateAsync(newVendor);
    await flushPromises();

    expect(VendorService.createVendor).toHaveBeenCalledWith(newVendor);
    // Should have refetched after mutation
    expect(VendorService.getVendors).toHaveBeenCalledTimes(2);
  });

  it('should delete a vendor and invalidate queries', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors);
    vi.mocked(VendorService.deleteVendor).mockResolvedValue();

    const { result } = withSetup(() => useVendors());
    await flushPromises();

    await result.deleteVendor.mutateAsync(1);
    await flushPromises();

    expect(VendorService.deleteVendor).toHaveBeenCalledWith(1);
    expect(VendorService.getVendors).toHaveBeenCalledTimes(2);
  });
});
