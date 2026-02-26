import type { Vendor } from '../types/Vendor';
const useNodeBackend = true; // Set to true if using Node backend, false for Java backend

// Use environment variables or default to localhost for development
const API_URL_JAVA = import.meta.env.VITE_API_URL_JAVA || 'http://localhost:3001/api';
const API_URL_NODE = import.meta.env.VITE_API_URL_NODE || 'http://localhost:3000/api';

const API_URL = useNodeBackend ? API_URL_NODE : API_URL_JAVA;
export const VendorService = {
  async getVendors(): Promise<Vendor[]> {
    try {
      const response = await fetch(`${API_URL}/vendors`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },
  
  async createVendor(vendor: Vendor): Promise<Vendor> {
    try {
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
    } catch (error: unknown) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  },
  
  async updateVendor(id: number, vendor: Vendor): Promise<Vendor> {
    try {
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
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  },

  async deleteVendor(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/vendors/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  },
}