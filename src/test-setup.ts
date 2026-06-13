import '@testing-library/jest-dom';

// Node 25 exposes a native localStorage global that lacks the full Web Storage API.
// Replace it with a proper in-memory implementation for all tests.
(function patchLocalStorage() {
  const store: Record<string, string> = {};
  const ls: Storage = {
    get length() { return Object.keys(store).length; },
    key(i: number) { return Object.keys(store)[i] ?? null; },
    getItem(k: string) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k: string, v: string) { store[k] = String(v); },
    removeItem(k: string) { delete store[k]; },
    clear() { Object.keys(store).forEach((k) => delete store[k]); },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: ls, writable: true, configurable: true });
})();
