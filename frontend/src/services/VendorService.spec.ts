import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Vendor, VendorInput } from '@/types/Vendor';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('VendorService', () => {
  let VendorService: typeof import('./VendorService').VendorService;

  const mockVendors: Vendor[] = [
    {
      id: 1,
      name: 'Acme Corp',
      contact_person: 'Jane Smith',
      email: 'jane@acme.com',
      partner_type: 'Partner',
    },
    {
      id: 2,
      name: 'Test LLC',
      contact_person: 'John Doe',
      email: 'john@test.com',
      partner_type: 'Supplier',
    },
  ];

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();

    const module = await import('./VendorService');
    VendorService = module.VendorService;
  });

  describe('getVendors', () => {
    it('should fetch vendors and return data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockVendors),
      });

      const result = await VendorService.getVendors();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/vendors'));
      expect(result).toEqual(mockVendors);
    });

    it('should throw on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      await expect(VendorService.getVendors()).rejects.toThrow('Internal server error');
    });

    it('should throw on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'));

      await expect(VendorService.getVendors()).rejects.toThrow('Network failure');
    });
  });

  describe('createVendor', () => {
    const newVendor: VendorInput = {
      name: 'New Corp',
      contact_person: 'Alice',
      email: 'alice@newcorp.com',
      partner_type: 'Supplier',
    };

    it('should send POST request with vendor data', async () => {
      const created = { ...newVendor, id: 3 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(created),
      });

      const result = await VendorService.createVendor(newVendor);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/vendors'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVendor),
        })
      );
      expect(result).toEqual(created);
    });

    it('should throw with error message on 409 conflict', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'Email already exists' }),
      });

      await expect(VendorService.createVendor(newVendor)).rejects.toThrow('Email already exists');
    });

    it('should throw with server error message on other non-ok responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Validation failed' }),
      });

      await expect(VendorService.createVendor(newVendor)).rejects.toThrow('Validation failed');
    });
  });

  describe('updateVendor', () => {
    const updatedVendor: VendorInput = {
      name: 'Acme Corp Updated',
      contact_person: 'Jane Smith',
      email: 'jane@acme.com',
      partner_type: 'Partner',
    };

    it('should send PUT request with vendor data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedVendor),
      });

      const result = await VendorService.updateVendor(1, updatedVendor);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/vendors/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedVendor),
        })
      );
      expect(result).toEqual(updatedVendor);
    });

    it('should throw with error message on 409 conflict', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'Email already exists' }),
      });

      await expect(VendorService.updateVendor(1, updatedVendor)).rejects.toThrow('Email already exists');
    });

    it('should throw with server error message on other non-ok responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      await expect(VendorService.updateVendor(1, updatedVendor)).rejects.toThrow('Internal server error');
    });
  });

  describe('deleteVendor', () => {
    it('should send DELETE request', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await VendorService.deleteVendor(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/vendors/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should throw on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Vendor not found' }),
      });

      await expect(VendorService.deleteVendor(999)).rejects.toThrow('Vendor not found');
    });

    it('should throw on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'));

      await expect(VendorService.deleteVendor(1)).rejects.toThrow('Network failure');
    });
  });
});
