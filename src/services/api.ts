import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ;

// Disable SSL certificate verification for development
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  httpsAgent: {
    rejectUnauthorized: false,
  },
});

// Add request interceptor to include authorization token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('📤 Sending request to:', config.url);
    console.log('🔐 Token:', token ? '✓ Present' : '✗ Missing');
    if (token) {
      config.headers = config.headers || {};
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = bearerToken;
      config.headers['X-Auth-Token'] = token;
      console.log('✓ Authorization headers set');
      console.log('🔐 Authorization header:', config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('📥 API Response Status:', response.status);
    console.log('📥 API Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error Status:', error.response?.status);
    console.error('❌ API Error Message:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const invoiceAPI = {
  login: async (username: string, password: string) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await axiosInstance.post('/Login', {
        Username: username,
        Password: password,
      });
      console.log('✅ Login successful');
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },
  
  getInvoiceList: async () => {
    try {
      console.log('🌐 Making API call to /Invoice/GetInvoiceList');
      const response = await axiosInstance.get('/Invoice/GetInvoiceList');
      console.log('✅ Successfully fetched invoices from API');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching invoice list:', error);
      throw error;
    }
  },

  getCompanies: async () => {
    try {
      console.log('🏢 Fetching companies...');
      const response = await axiosInstance.get('/Material/GetCompanies');
      console.log('✅ Successfully fetched companies');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      throw error;
    }
  },

  getMaterials: async () => {
    try {
      console.log('📦 Fetching materials...');
      const response = await axiosInstance.get('/Material/GetList');
      console.log('✅ Successfully fetched materials');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching materials:', error);
      throw error;
    }
  },

  addInvoice: async (payload: any) => {
    try {
      console.log('💾 Submitting invoice...');
      const response = await axiosInstance.post('/Invoice/AddInvoice', payload);
      console.log('✅ Invoice submitted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting invoice:', error);
      throw error;
    }
  },
};

export const DCAPI = {
  GetDCList: async () => {
    try {
      console.log('🌐 Making API call to /DC/GetDCList');
      const response = await axiosInstance.get('/DC/GetDCList');
      console.log('✅ Successfully fetched DC list');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching DC list:', error);
      throw error;
    }
  },

  AddDC: async (payload: any) => {
    try {
      console.log('💾 Submitting DC...');
      const response = await axiosInstance.post('/DC/AddDC', payload);
      console.log('✅ DC submitted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting DC:', error);
      throw error;
    }
  },

  DeleteDC: async (id: number) => {
    try {
      console.log('🗑️ Deleting DC with ID:', id);
      const response = await axiosInstance.delete(`/DC/DeleteDC/${id}`);
      console.log('✅ DC deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting DC:', error);
      throw error;
    }
  },
};

export default axiosInstance;
