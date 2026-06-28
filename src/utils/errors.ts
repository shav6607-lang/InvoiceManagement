import axios from 'axios';

export const getErrorMessage = (error: unknown, fallback = 'An unexpected error occurred'): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { Message?: string; message?: string } | undefined;
    return data?.Message ?? data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const unwrapArrayResponse = <T>(data: T[] | { data?: T[]; result?: T[] }): T[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.result)) return data.result;
  }
  return [];
};
