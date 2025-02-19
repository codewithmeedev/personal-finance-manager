// src/hooks/useDebounce.ts
import { useRef, useCallback } from "react";

export function useDebounce(callback: (...args: any[]) => void, delay: number) {
  const timer = useRef<number | undefined>();

  const debouncedCallback = useCallback((...args: any[]) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  return debouncedCallback;
}
