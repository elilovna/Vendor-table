import type { Vendor, VendorInput } from '../types/Vendor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const VendorService = {
  async getVendors(): Promise<Vendor[]> {
    const response = await fetch(`${API_URL}/vendors`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async createVendor(vendor: VendorInput): Promise<Vendor> {
    const response = await fetch(`${API_URL}/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vendor),
    });

    if (!response.ok) {
      if (response.status === 409) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async updateVendor(id: number, vendor: VendorInput): Promise<Vendor> {
    const response = await fetch(`${API_URL}/vendors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vendor),
    });

    if (!response.ok) {
      if (response.status === 409) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async deleteVendor(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/vendors/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
}