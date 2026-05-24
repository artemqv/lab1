import { beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

(globalThis as any).localStorage = localStorageMock;

// Mock document
(globalThis as any).document = {
  documentElement: {
    setAttribute: () => {},
  },
};

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
