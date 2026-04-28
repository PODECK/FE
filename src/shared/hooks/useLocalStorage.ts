'use client';

import { useCallback } from 'react';

function isBrowser() {
  return typeof window !== 'undefined';
} // NextJS SSR 환경 에러 방지 목적

export function useLocalStorage<T>(key: string) {
  const setItem = useCallback(
    (value: T) => {
      if (!isBrowser()) return;

      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(error);
      }
    },
    [key],
  );

  const getItem = useCallback((): T | null => {
    if (!isBrowser()) return null;

    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [key]);

  const removeItem = useCallback(() => {
    if (!isBrowser()) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  return {
    setItem,
    getItem,
    removeItem,
  };
}
