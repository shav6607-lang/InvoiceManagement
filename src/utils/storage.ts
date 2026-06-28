import { STORAGE_KEYS } from '@/constants';

export const storage = {
  getToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return token?.trim() ? token : null;
  },

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  getUser<T>(): T | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setUser<T>(user: T): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  clearAuth(): void {
    this.removeToken();
    this.removeUser();
  },
};
