import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { API_ENDPOINTS, PUBLIC_API_ENDPOINTS, ROUTES } from '@/constants';
import { logger } from '@/utils/logger';
import { storage } from '@/utils/storage';
import { AuthenticationRequiredError } from '@/utils/authErrors';

const normalizePath = (url?: string): string => {
  if (!url) return '';
  const path = url.split('?')[0];
  return path.startsWith('/') ? path : `/${path}`;
};

const isPublicEndpoint = (url?: string): boolean => {
  const path = normalizePath(url);
  return PUBLIC_API_ENDPOINTS.some(
    (endpoint) => path === endpoint || path.endsWith(endpoint),
  );
};

const isLoginEndpoint = (url?: string): boolean => {
  const path = normalizePath(url);
  return path === API_ENDPOINTS.LOGIN || path.endsWith(API_ENDPOINTS.LOGIN);
};

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    const publicRequest = isPublicEndpoint(config.url);

    if (!token && !publicRequest) {
      logger.debug(`Blocked unauthenticated request: ${config.method?.toUpperCase()} ${config.url}`);
      return Promise.reject(new AuthenticationRequiredError());
    }

    if (token && !isLoginEndpoint(config.url)) {
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = bearerToken;
      config.headers['X-Auth-Token'] = token;
    }

    logger.debug(`API request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => {
    logger.debug(`API response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    if (error instanceof AuthenticationRequiredError) {
      return Promise.reject(error);
    }

    logger.error('API error', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    });

    if (error.response?.status === 401 && !isLoginEndpoint(error.config?.url)) {
      storage.clearAuth();
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.href = ROUTES.LOGIN;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

export const getStoredToken = (): string | null => storage.getToken();

export { STORAGE_KEYS } from '@/constants';
