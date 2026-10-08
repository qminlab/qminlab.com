'use client';
import { useSyncExternalStore } from 'react';

export const MOBILE_QUERY = '(max-width: 1023.98px)';

export function useMedia(query: string, server = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');
