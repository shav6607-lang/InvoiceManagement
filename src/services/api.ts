import { API_ENDPOINTS } from '@/constants';
import type { LoginResponse } from '@/types/api.types';
import axiosInstance from './apiClient';

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
      Username: username,
      Password: password,
    });
    return response.data;
  },
};

export const invoiceApi = {
  getList: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.INVOICE_LIST);
    return response.data;
  },

  add: async (payload: Record<string, unknown>) => {
    const response = await axiosInstance.post(API_ENDPOINTS.INVOICE_ADD, payload);
    return response.data;
  },
};

export const dcApi = {
  getList: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.DC_LIST);
    return response.data;
  },

  add: async (payload: Record<string, unknown>) => {
    const response = await axiosInstance.post(API_ENDPOINTS.DC_ADD, payload);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.DC_DELETE(id));
    return response.data;
  },
};

export interface MaterialListParams {
  companyId?: number;
  materialType?: number;
}

export const materialApi = {
  getCompanies: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.COMPANIES);
    return response.data;
  },

  getList: async (params?: MaterialListParams) => {
    const response = await axiosInstance.get(API_ENDPOINTS.MATERIALS, { params });
    return response.data;
  },

  addMaterial: async (payload: Record<string, unknown>) => {
    const response = await axiosInstance.post(API_ENDPOINTS.MATERIAL_ADD, payload);
    return response.data;
  },
};

/** @deprecated Use named exports: authApi, invoiceApi, dcApi, materialApi */
export const invoiceAPI = {
  login: authApi.login,
  getInvoiceList: invoiceApi.getList,
  getCompanies: materialApi.getCompanies,
  getMaterials: materialApi.getList,
  addInvoice: invoiceApi.add,
};

/** @deprecated Use dcApi instead */
export const DCAPI = {
  GetDCList: dcApi.getList,
  AddDC: dcApi.add,
  DeleteDC: dcApi.delete,
};

export { default as axiosInstance } from './apiClient';
