const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

if (!apiBaseUrl && import.meta.env.PROD) {
  console.warn('[config] VITE_API_BASE_URL is not set. API requests will fail.');
}

export const env = {
  apiBaseUrl,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
