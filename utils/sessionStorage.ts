/**
 * Simple session storage for React Native
 * Persists during app session but resets on reload
 */

const storage = new Map<string, string>();

export const sessionStorage = {
  getItem: (key: string): string | null => {
    return storage.get(key) ?? null;
  },
  
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  
  removeItem: (key: string): void => {
    storage.delete(key);
  },
  
  clear: (): void => {
    storage.clear();
  },
};

